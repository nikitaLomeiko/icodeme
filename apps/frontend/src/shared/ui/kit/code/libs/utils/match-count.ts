export function MatchCount(searchQuery: string, value: string) {
    if (!searchQuery) return 0;
    
    let count = 0;
    let idx = 0;
    
    while (true) {
      idx = value.indexOf(searchQuery, idx);
      if (idx === -1) break;
      count++;
      idx += searchQuery.length;
    }
    
    return count;
}