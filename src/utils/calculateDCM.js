export function calculateDCM(users, winningSide, maxLeverage = 5) {
  users.forEach(u => {
    const confidenceFactor = u.confidence / 100;
    u.multiplier = 1 + (maxLeverage - 1) * confidenceFactor;
    u.weight = u.stake * u.multiplier;
  });

  const totalWeightA = users.filter(u => u.side === "YES")
                            .reduce((sum, u) => sum + u.weight, 0);
  const totalWeightB = users.filter(u => u.side === "NO")
                            .reduce((sum, u) => sum + u.weight, 0);

  const losingPool = users.filter(u => u.side !== winningSide)
                          .reduce((sum, u) => sum + u.stake, 0);

  const winnerTotalWeight = (winningSide === "YES") ? totalWeightA : totalWeightB;

  users.forEach(u => {
    if (u.side === winningSide) {
      const share = u.weight / winnerTotalWeight;
      const profit = share * losingPool;
      u.final = u.stake + profit;
    } else {
      u.final = 0;
    }
  });

  return users;
}
