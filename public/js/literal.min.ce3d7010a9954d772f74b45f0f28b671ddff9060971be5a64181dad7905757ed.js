const target=document.querySelector("#literal-widget"),variables={handle:"kwon",readingStatus:"IS_READING",layout:target.getAttribute("layout"),limit:parseInt(target.getAttribute("limit"))||1};fetch("https://backend.literal.club/",{method:"POST",mode:"cors",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:`
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
	`,variables:{handle:variables.handle,readingStatus:variables.readingStatus,limit:variables.limit,offset:0}})}).then(e=>e.json()).then(e=>{const t=e.data.booksByReadingStateAndHandle||[],n=new Intl.ListFormat("en",{style:"short",type:"conjunction"}),s=t.map(e=>{const s=n.format(e.authors.map(e=>e.name)),t=document.createElement("div");return t.classList.add("literal-book-item"),t.innerHTML=`
			<a href="https://literal.club/${variables.handle}/book/${e.slug}">
				<div class="literal-book-item__inner">
					<div class="literal-book-item__image">
						<div class="literal-book-item__image_cover__outer">
							<img src="${e.cover}" alt="${e.title}" />
						</div>
					</div>
					<div class="literal-book-item__info">
						<div class="literal-book-item__title">
							${e.title}
						</div>
						<div class="literal-book-item__authors">
							${s}
						</div>
					</div>
				</div>
			</a>
		`,t});target.append(...s)});var list=`
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
`,styleSheet=document.createElement("style");styleSheet.innerHTML=variables.layout==="row"?row:list,document.head.appendChild(styleSheet)