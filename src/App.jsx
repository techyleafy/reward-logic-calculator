import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

export default function DCMCalculator() {
  const [darkMode, setDarkMode] = useState(true);
  const [maxLeverage, setMaxLeverage] = useState(5); // adjustable
  const [users, setUsers] = useState([
    { name: "User 1", stake: 100, confidence: 80, side: "YES" },
    { name: "User 2", stake: 100, confidence: 30, side: "YES" },
    { name: "User 3", stake: 100, confidence: 60, side: "NO" },
    { name: "User 4", stake: 100, confidence: 50, side: "YES" },
  ]);
  const [winningSide, setWinningSide] = useState("YES");
  const [results, setResults] = useState(null);

  const addUser = () => {
    setUsers([
      ...users,
      { name: `User ${users.length + 1}`, stake: 100, confidence: 50, side: "YES" },
    ]);
  };

  const removeUser = (index) => {
    const updated = [...users];
    updated.splice(index, 1);
    setUsers(updated);
  };

  // === Correct DCM calculation using confidence -> multiplier -> weight ===
  const calculate = () => {
    if (users.length === 0) return;

    // 1) Compute multiplier and weight for each user
    const cloned = users.map((u) => {
      const stake = Number(u.stake) || 0;
      const confidence = Math.max(0, Math.min(100, Number(u.confidence) || 0));
      const multiplier = 1 + (Number(maxLeverage) - 1) * (confidence / 100);
      const weight = stake * multiplier;
      return { ...u, stake, confidence, multiplier, weight };
    });

    // 2) Totals by side (weights and stakes)
    const totalWeightYes = cloned
      .filter((u) => u.side === "YES")
      .reduce((s, u) => s + u.weight, 0);
    const totalWeightNo = cloned
      .filter((u) => u.side === "NO")
      .reduce((s, u) => s + u.weight, 0);

    const totalStakeYes = cloned
      .filter((u) => u.side === "YES")
      .reduce((s, u) => s + u.stake, 0);
    const totalStakeNo = cloned
      .filter((u) => u.side === "NO")
      .reduce((s, u) => s + u.stake, 0);

    const totalStake = totalStakeYes + totalStakeNo;

    // 3) losing pool (sum of stakes of losers — stakes only, not weights)
    const losingPool = winningSide === "YES" ? totalStakeNo : totalStakeYes;

    // 4) winner total weight
    const winnerTotalWeight = winningSide === "YES" ? totalWeightYes : totalWeightNo;

    // 5) Compute payouts
    const payouts = cloned.map((u) => {
      if (u.side === winningSide) {
        // if winnerTotalWeight is 0 (edge) avoid div by zero
        const share = winnerTotalWeight > 0 ? u.weight / winnerTotalWeight : 0;
        const profit = share * losingPool;
        const payout = u.stake + profit;
        return {
          ...u,
          payout,
          profit: payout - u.stake,
        };
      } else {
        return {
          ...u,
          payout: 0,
          profit: -u.stake,
        };
      }
    });

    const totalProfit = payouts.reduce((s, p) => s + p.profit, 0);
    const avgConfidence = (cloned.reduce((s, u) => s + u.confidence, 0) / cloned.length) || 0;

    setResults({
      totalStake,
      totalStakeYes,
      totalStakeNo,
      totalWeightYes,
      totalWeightNo,
      losingPool,
      winnerTotalWeight,
      payouts,
      totalProfit,
      avgConfidence: avgConfidence.toFixed(1),
      maxLeverage,
    });
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} min-h-screen transition-colors duration-500`}>
      <motion.div
        className={`max-w-5xl mx-auto p-6 rounded-2xl shadow-xl ${darkMode ? "bg-gray-800" : "bg-white"}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">💡 DCM Calculator</h1>
          <div className="flex items-center gap-3">
            <label className="text-sm opacity-80">Max Leverage</label>
            <input
              type="number"
              min="1"
              max="20"
              step="0.5"
              value={maxLeverage}
              onChange={(e) => setMaxLeverage(Number(e.target.value))}
              className="w-20 px-2 py-1 rounded border text-sm"
            />
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-3 py-1 border rounded-lg hover:shadow transition text-sm"
            >
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full border border-gray-200 rounded-lg text-sm">
            <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-center">Stake</th>
                <th className="p-2 text-center">Confidence (%)</th>
                <th className="p-2 text-center">Side</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className={darkMode ? "border-t border-gray-600" : "border-t"}>
                  <td className="p-2">{u.name}</td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      value={u.stake}
                      onChange={(e) => {
                        const updated = [...users];
                        updated[i].stake = e.target.value;
                        setUsers(updated);
                      }}
                      className={`border px-2 py-1 rounded w-24 text-center ${darkMode ? "bg-gray-700 border-gray-600" : ""}`}
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      value={u.confidence}
                      onChange={(e) => {
                        const updated = [...users];
                        updated[i].confidence = e.target.value;
                        setUsers(updated);
                      }}
                      className={`border px-2 py-1 rounded w-20 text-center ${darkMode ? "bg-gray-700 border-gray-600" : ""}`}
                    />
                  </td>
                  <td className="p-2 text-center">
                    <select
                      value={u.side}
                      onChange={(e) => {
                        const updated = [...users];
                        updated[i].side = e.target.value;
                        setUsers(updated);
                      }}
                      className={`border px-2 py-1 rounded ${darkMode ? "bg-gray-700 border-gray-600" : ""}`}
                    >
                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                    </select>
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => removeUser(i)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                    >
                      ✖
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 mt-5 items-center">
          <button onClick={addUser} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow">➕ Add User</button>
          <select value={winningSide} onChange={(e) => setWinningSide(e.target.value)} className={`border px-2 py-2 rounded ${darkMode ? "bg-gray-700 border-gray-600" : ""}`}>
            <option value="YES">YES</option>
            <option value="NO">NO</option>
          </select>
          <button onClick={calculate} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow">⚡ Calculate</button>
        </div>

        {/* Results */}
        {results && (
          <motion.div className="mt-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className={`${darkMode ? "bg-blue-900" : "bg-blue-50"} p-4 rounded-lg`}>
                <p className="text-sm opacity-70">💰 Total Stake</p>
                <p className="text-xl font-bold">{results.totalStake}</p>
                <p className="text-xs opacity-60">Weights (YES / NO): {Math.round(results.totalWeightYes)}/{Math.round(results.totalWeightNo)}</p>
              </div>

              <div className={`${darkMode ? "bg-green-900" : "bg-green-50"} p-4 rounded-lg`}>
                <p className="text-sm opacity-70">🏆 Winning Side</p>
                <p className="text-xl font-bold text-green-400">{winningSide}</p>
                <p className="text-xs opacity-60">Losing pool: {results.losingPool}</p>
              </div>

              <div className={`${darkMode ? "bg-yellow-900" : "bg-yellow-50"} p-4 rounded-lg`}>
                <p className="text-sm opacity-70">⚙️ Avg. Confidence</p>
                <p className="text-xl font-bold">{results.avgConfidence}%</p>
                <p className="text-xs opacity-60">Max Leverage: {results.maxLeverage}x</p>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${darkMode ? "border-gray-700 bg-gray-800" : "bg-gray-50 border-gray-200"}`}>
              <h2 className="text-lg font-semibold mb-3">📊 User Payouts</h2>
              <table className="w-full text-sm">
                <thead className={darkMode ? "bg-gray-700" : "bg-gray-100"}>
                  <tr>
                    <th className="p-2 text-left">User</th>
                    <th className="p-2 text-center">Side</th>
                    <th className="p-2 text-center">Stake</th>
                    <th className="p-2 text-center">Multiplier</th>
                    <th className="p-2 text-center">Weight</th>
                    <th className="p-2 text-center">Payout</th>
                    <th className="p-2 text-center">Profit/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {results.payouts.map((p, i) => (
                    <tr key={i} className={darkMode ? "border-t border-gray-600" : "border-t text-center"}>
                      <td className="p-2">{p.name}</td>
                      <td className="p-2 text-center">{p.side}</td>
                      <td className="p-2 text-center">{p.stake}</td>
                      <td className="p-2 text-center">{p.multiplier.toFixed(2)}</td>
                      <td className="p-2 text-center">{p.weight.toFixed(2)}</td>
                      <td className="p-2 text-center">{p.payout.toFixed(2)}</td>
                      <td className={`p-2 font-semibold text-center ${p.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {p.profit >= 0 ? `+${p.profit.toFixed(2)}` : p.profit.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={`p-4 rounded-lg border shadow-sm ${darkMode ? "border-gray-700 bg-gray-800" : "bg-white border-gray-200"}`}>
              <h2 className="text-lg font-semibold mb-3 text-center">📈 Profit/Loss Visualization</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={results.payouts}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="profit">
                    {results.payouts.map((entry, index) => (
                      <Cell key={index} fill={entry.profit >= 0 ? "#22c55e" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
