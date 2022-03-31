interface MatchResult {
  match: string | undefined;
  nomatch: string | undefined;
}

const findSingleDestinationValueUsingRegexMatching = (map: any, searchFor: string): MatchResult => {
  const match = Object.keys(map).find((key: string) => new RegExp(key, 'i').test(searchFor));
  return {
    match,
    nomatch: match ? undefined : searchFor,
  };
};

const checkMappingIsPossible = (matchResults: MatchResult[], errorMessageHandler: (t: string) => string) => {
  const badItems: any[] = matchResults
    .filter((typeMatchResult: MatchResult) => typeMatchResult.nomatch)
    .map((typeMatchResult: MatchResult) => typeMatchResult.nomatch);
  if (badItems.length) {
    throw new Error(errorMessageHandler(JSON.stringify(badItems)));
  }
};

const findAllDestinationValuesUsingRegexMatching = (stories: any[], map: Record<string, string>, storyItemKey: string): string[] => {
  const storyTypeMatchResults: MatchResult[] = stories.map((story: any) => findSingleDestinationValueUsingRegexMatching(map, story[storyItemKey]));
  checkMappingIsPossible(storyTypeMatchResults, (badTypes: string) => `Could not map the ${storyItemKey}(es) ${Array.from(new Set(badTypes))}`);
  return storyTypeMatchResults.map((s: MatchResult) => map[s.match as string]);
};

export default findAllDestinationValuesUsingRegexMatching;
