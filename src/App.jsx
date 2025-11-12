import React, { useState } from "react";
import { calculateDCM } from "./utils/calculateDCM";

export default function App() {
  const [users, setUsers] = useState([
    { name: "A", stake: 100, confidence: 80, side: "YES" },
    { name: "B", stake: 100, confidence: 30, side: "YES" },
    { name: "C", stake: 100, confidence: 60, side: "NO" }
  ]);
  const [winningSide, setWinningSide] = useState("YES");
  const [results, setResults] = useState([]);

  const handleCalculate = () => {
    const cloned = JSON.parse(JSON.stringify(users));
    const res = calculateDCM(cloned, winningSide, 5);
    setResults(res);
  };

  const handleChange = (i, field, value) => {
    const newUsers = [...users];
    newUsers[i][field] = field === "name" ? value : Number(value);
    setUsers(newUsers);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold mb-6">💹 DCM Calculator</h1>
      <div className="bg-white shadow-xl rounded-2xl p-6 w-11/12 md:w-2/3">
        <table className="table-auto w-full mb-6 border">
          <thead>
            <tr className="bg-gray-200">
              <th>Name</th>
              <th>Stake</th>
              <th>Confidence (%)</th>
              <th>Side</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i} className="text-center border-t">
                <td>
                  <input
                    value={u.name}
                    onChange={e => handleChange(i, "name", e.target.value)}
                    className="border p-1 w-20 text-center rounded"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={u.stake}
                    onChange={e => handleChange(i, "stake", e.target.value)}
                    className="border p-1 w-20 text-center rounded"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={u.confidence}
                    onChange={e => handleChange(i, "confidence", e.target.value)}
                    className="border p-1 w-20 text-center rounded"
                  />
                </td>
                <td>
                  <select
                    value={u.side}
                    onChange={e => handleChange(i, "side", e.target.value)}
                    className="border p-1 rounded"
                  >
                    <option>YES</option>
                    <option>NO</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center mb-6">
          <label>
            <span className="font-semibold mr-2">Winning Side:</span>
            <select
              value={winningSide}
              onChange={e => setWinningSide(e.target.value)}
              className="border p-1 rounded"
            >
              <option>YES</option>
              <option>NO</option>
            </select>
          </label>

          <button
            onClick={handleCalculate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Calculate
          </button>
        </div>

        {results.length > 0 && (
          <table className="table-auto w-full border mt-4">
            <thead>
              <tr className="bg-green-100">
                <th>Name</th>
                <th>Multiplier</th>
                <th>Weight</th>
                <th>Final Payout</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="text-center border-t">
                  <td>{r.name}</td>
                  <td>{r.multiplier.toFixed(2)}</td>
                  <td>{r.weight.toFixed(2)}</td>
                  <td className="font-semibold">
                    {r.final.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
