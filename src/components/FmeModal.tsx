import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { InlineMath, BlockMath } from "react-katex";
import RsaCipher from "../utils/RsaCipher";
import type { RsaOperationResult } from "../utils/RsaCipher";
import ModExpStepsTable from "./ModExpStepsTable";

interface FmeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FmeModal = ({ isOpen, onClose }: FmeModalProps) => {
  const [fmeBase, setFmeBase] = useState<number>(0);
  const [fmeExponent, setFmeExponent] = useState<number>(0);
  const [fmeModulus, setFmeModulus] = useState<number>(0);
  const [fmeResult, setFmeResult] = useState<RsaOperationResult | null>(null);
  const [fmeError, setFmeError] = useState<string | null>(null);

  // Calculate custom Fast Modular Exponentiation
  const calculateFme = () => {
    setFmeError(null);

    try {
      // Using the modExpWithSteps function to calculate and track steps
      const { result, steps } = RsaCipher.modExpWithSteps(
        fmeBase,
        fmeExponent,
        fmeModulus
      );

      setFmeResult({
        message: fmeBase,
        result: result,
        steps: steps,
      });
    } catch (err) {
      if (err instanceof Error) {
        setFmeError(err.message);
      } else {
        setFmeError("An error occurred during calculation");
      }
      setFmeResult(null);
    }
  };

  const clearFme = () => {
    setFmeBase(0);
    setFmeExponent(0);
    setFmeModulus(0);
    setFmeResult(null);
    setFmeError(null);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Fast Modular Exponentiation Calculator
                </Dialog.Title>

                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="fme-base"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Base (a)
                    </label>
                    <input
                      id="fme-base"
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={fmeBase === 0 ? '' : fmeBase}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value);
                        if (!isNaN(value)) {
                          setFmeBase(value);
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="fme-exponent"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Exponent (c)
                    </label>
                    <input
                      id="fme-exponent"
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={fmeExponent === 0 ? '' : fmeExponent}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value);
                        if (!isNaN(value)) {
                          setFmeExponent(value);
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="fme-modulus"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Modulus (b)
                    </label>
                    <input
                      id="fme-modulus"
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={fmeModulus === 0 ? '' : fmeModulus}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value);
                        if (!isNaN(value)) {
                          setFmeModulus(value);
                        }
                      }}
                    />
                  </div>

                  {fmeError && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-md">
                      {fmeError}
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <div className="flex gap-4">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-green-900 bg-green-200 border border-transparent rounded-md hover:bg-green-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                        onClick={calculateFme}
                      >
                        Calculate
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={clearFme}
                      >
                        Clear
                      </button>
                    </div>

                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-transparent rounded-md hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={onClose}
                    >
                      Close
                    </button>
                  </div>

                  {fmeResult && (
                    <div className="mt-4">
                      <h4 className="text-md font-semibold mb-2">Result</h4>
                      <p>
                        <BlockMath
                          math={`${fmeBase}^{${fmeExponent}} \\mod ${fmeModulus} = ${fmeResult.result}`}
                        />
                      </p>

                      <div className="mt-4">
                        <h4 className="text-md font-semibold mb-2">
                          Fast Modular Exponentiation
                        </h4>
                        <p className="mb-2">
                          <InlineMath
                            math={`${fmeBase}^{${fmeExponent}} \\mod ${fmeModulus}`}
                          />
                        </p>
                        <p className="mb-2">
                          <InlineMath
                            math={`${fmeExponent}_{10} = ${fmeExponent.toString(
                              2
                            )}_{2}`}
                          />
                        </p>
                        <ModExpStepsTable steps={fmeResult.steps} />
                      </div>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default FmeModal;