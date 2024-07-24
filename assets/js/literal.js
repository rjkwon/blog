const target = document.querySelector('#literal-widget');

const variables = {
  handle: 'kwon',
  readingStatus: 'IS_READING',
  layout: target.getAttribute('layout'),
  limit: parseInt(target.getAttribute('limit')) || 1,
};

fetch('https://backend.literal.club/', {
  method: 'POST',
  mode: 'cors',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: `
		query booksByReadingStateAndHandle($limit: Int!, $offset: Int!, $readingStatus: ReadingStatus!, $handle: String!) {
			booksByReadingStateAndHandle(
				limit: $limit
				offset: $offset
				readingStatus: $readingStatus
				handle: $handle
			) {
				...BookParts
				__typename
			}
		}
		
		fragment BookParts on Book {
			id
			slug
			title
			subtitle
			description
			isbn10
			isbn13
			language
			pageCount
			publishedDate
			publisher
			physicalFormat
			cover
			authors {
				...AuthorMini
				__typename
			}
			gradientColors
			workId
			__typename
		}
		
		fragment AuthorMini on Author {
			id
			name
			slug
			__typename
		}
	`,
    variables: {
      handle: variables.handle,
      readingStatus: variables.readingStatus,
      limit: variables.limit,
      offset: 0,
    },
  }),
})
  .then((response) => {
    return response.json();
  })
  .then((response) => {
    const books = response.data.booksByReadingStateAndHandle || [];

    const formatter = new Intl.ListFormat('en', { style: 'short', type: 'conjunction' });

    const bookItems = books.map((book) => {
      const authors = formatter.format(book.authors.map((a) => a.name));
      const bookItem = document.createElement('div');
      bookItem.classList.add('literal-book-item');
      bookItem.innerHTML = `
			<a href="https://literal.club/${variables.handle}/book/${book.slug}">
				<div class="literal-book-item__inner">
					<div class="literal-book-item__image">
						<div class="literal-book-item__image_cover__outer">
							<img src="${book.cover}" alt="${book.title}" />
						</div>
					</div>
					<div class="literal-book-item__info">
						<div class="literal-book-item__title">
							${book.title}
						</div>
						<div class="literal-book-item__authors">
							${authors}
						</div>
					</div>
				</div>
			</a>
		`;
      return bookItem;
    });

    target.append(...bookItems);
  });

var list = `
    #literal-widget .literal-book-item {
      display: flex;
      text-align: left;
      position: relative;
      transition: all .2s linear;
    }
    #literal-widget .literal-book-item:hover {
    	border-color: #e1dddd;
    	z-index: 1;
    }
    #literal-widget .literal-book-item a {
    	width: 100%;
    	display: flex;
    	padding: 10px 10px 10px 0;
    }
    #literal-widget .literal-book-item__inner {
    	flex: 1 0;
	    display: flex;
	    align-items: center;
    }
    #literal-widget .literal-book-item__image {
        width: 140px;
        flex: 0 0 140px;
        align-self: flex-start;
        display: flex;
        align-items: center;
    }
    #literal-widget .literal-book-item__image_cover__outer {
	}
    #literal-widget .literal-book-item__title {
    	line-height: 150%;
    }
    #literal-widget .literal-book-item__authors {
    	line-height: 145%;
    	margin-top: 4px;
    	font-weight: normal;
    }
`;

var styleSheet = document.createElement('style');
styleSheet.innerHTML = variables.layout === 'row' ? row : list;
document.head.appendChild(styleSheet);