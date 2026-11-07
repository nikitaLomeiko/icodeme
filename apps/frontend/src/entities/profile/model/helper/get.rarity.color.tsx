export const getRarityColor = (rarity?: string, isLocked?: boolean) => {
  if (isLocked) return "from-gray-600 to-gray-700 border-gray-600 opacity-45";
  switch (rarity) {
    case "legendary":
      return "from-yellow-600 to-orange-600 border-yellow-500";
    case "epic":
      return "from-purple-600 to-pink-600 border-purple-500";
    case "rare":
      return "from-blue-600 to-cyan-600 border-blue-500";
    default:
      return "from-green-600 to-emerald-600 border-green-500";
  }
};
