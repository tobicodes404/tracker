export const SEARCH_QUERY = `
  query ($search: String, $type: MediaType) {
    Page(perPage: 10) {
      media(search: $search, type: $type) {
        id
        title { romaji english native }
        coverImage { large }
      }
    }
  }
`;

export const DETAILS_QUERY = `
  query ($id: Int) {
    Media(id: $id) {
      id
      title { romaji english native }
      description
      staff { edges { node { name { full } } role } }
      status
      genres
      chapters
      coverImage { large }
    }
  }
`;
