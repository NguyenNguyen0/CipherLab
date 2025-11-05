import { useState } from "react";
import { InlineMath } from "react-katex";
import type { ModExpStep } from "../utils/RsaCipher";

export default function ModExpStepsTable(steps: ModExpStep[]) {
  const [showMore, setShowMore] = useState(true);
  return (
    <div className="overflow-x-auto">
      <button onClick={() => setShowMore(!showMore)}>
        {showMore ? "👁️" : "❎"}
      </button>
      <table className="min-w-full divide-y divide-gray-200 border">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-3 py-2 text-center text-sm font-bold text-gray-500 tracking-wider">
              <InlineMath math="b[i]" />
            </th>
            <th className="px-3 py-2 text-center text-sm font-bold text-gray-500 tracking-wider">
              <InlineMath math="p = p^2" />
            </th>
            <th className="px-3 py-2 text-center text-sm font-bold text-gray-500 tracking-wider">
              <InlineMath math="p = p \mod n" />
            </th>
            <th className="px-3 py-2 text-center text-sm font-bold text-gray-500 tracking-wider">
              <InlineMath math="p \cdot z" />
            </th>
            <th className="px-3 py-2 text-center text-sm font-bold text-gray-500 tracking-wider">
              <InlineMath math="p = p \mod n" />
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {steps.map((step, index) => (
            <tr key={index} className={index % 2 ? "bg-gray-50" : "bg-white"}>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.bit}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${ showMore ? step.pSquared : ''}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.pMod}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.z || "-"}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.result}`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
