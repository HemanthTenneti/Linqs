declare module "word-extractor" {
  interface ExtractedDocument {
    getBody(): string;
  }

  class WordExtractor {
    extract(input: Buffer | string): Promise<ExtractedDocument>;
  }

  export default WordExtractor;
}
