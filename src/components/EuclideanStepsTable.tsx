import { InlineMath } from "react-katex";
import type { EuclideanStep } from "../utils/RsaCipher";

interface EuclideanStepsTableProps {
  steps: EuclideanStep[];
}

const EuclideanStepsTable = ({ steps }: EuclideanStepsTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-3 py-2 text-center text-sm font-bold text-gray-500 tracking-wider">
              <InlineMath math="q" />
            </th>
            <th className="px-3 py-2 text-center text-sm font-bold text-gray-500 tracking-wider">
              <InlineMath math="r_1" />
            </th>
            <th className="px-3 py-2 text-center text-sm font-bold text-gray-500 tracking-wider">
              <InlineMath math="r_2" />
            </th>
            <th className="px-3 py-2 text-center text-sm font-bold text-gray-500 tracking-wider">
              <InlineMath math="r" />
            </th>
            <th className="px-3 py-2 text-center text-sm font-bold text-gray-500 tracking-wider">
              <InlineMath math="t_1" />
            </th>
            <th className="px-3 py-2 text-center text-sm font-bold text-gray-500 tracking-wider">
              <InlineMath math="t_2" />
            </th>
            <th className="px-3 py-2 text-center text-sm font-bold text-gray-500 tracking-wider">
              <InlineMath math="t" />
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {steps.map((step, index) => (
            <tr key={index} className={index % 2 ? "bg-gray-50" : "bg-white"}>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.q}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.r1}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.r2}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.r}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.t1}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.t2}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.t}`} />
              </td>
            </tr>
          ))}
          {steps.length > 0 && (
            <tr className={steps.length % 2 ? "bg-gray-50" : "bg-white"}>
              <td className="px-3 py-2 text-center text-sm font-mono"></td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${steps[steps.length - 1].r2}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${steps[steps.length - 1].r}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono"></td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${steps[steps.length - 1].t2}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${steps[steps.length - 1].t}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono"></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EuclideanStepsTable;