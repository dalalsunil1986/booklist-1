const { createSelector } = require('../../../util/reselect');
const { LOAD_BOOKS, LOAD_BOOKS_RESULTS, TOGGLE_SELECT_BOOK, SELECT_ALL_BOOKS, DE_SELECT_ALL_BOOKS } = require('../actions/actionNames');
const { SET_BOOKS_SUBJECTS } = require('../actions/bookSubjectModify/actionNames');
const { setBookResultsSubjects } = require('../util/booksSubjectsHelpers');

const initialBooksState = {
    booksHash: {},
    loading: false,
    selectedBooks: {}
};

function booksReducer(state = initialBooksState, action){
    switch(action.type) {
        case LOAD_BOOKS:
            return Object.assign({}, state, { loading: true });
        case LOAD_BOOKS_RESULTS:
            return Object.assign({}, state, { loading: false, booksHash: createBooksHash(action.books) });
        case TOGGLE_SELECT_BOOK:
            return Object.assign({}, state, { selectedBooks: { ...state.selectedBooks, [action._id]: !state.selectedBooks[action._id] } });
        case SELECT_ALL_BOOKS:
            var newBookList = state.list.map(b => Object.assign({}, b, { selected: true }));
            return Object.assign({}, state, { list: newBookList, selectedCount: newBookList.length });
        case DE_SELECT_ALL_BOOKS:
            var newBookList = state.list.map(b => Object.assign({}, b, { selected: false }));
            return Object.assign({}, state, { list: newBookList, selectedCount: 0 });
        case SET_BOOKS_SUBJECTS:
            var newBookHash = { ...state.booksHash };

            action.books.forEach(_id => {
                let book = { ...newBookHash[_id] },
                    booksSubjectsHash = {};

                book.subjects.forEach(_id => booksSubjectsHash[_id] = true);

                action.add.forEach(sAdd => booksSubjectsHash[sAdd] = true);
                action.remove.forEach(sAdd => booksSubjectsHash[sAdd] = false);

                book.subjects = Object.keys(booksSubjectsHash).filter(_id => booksSubjectsHash[_id]);
                newBookHash[_id] = book;
            });

            return Object.assign({}, state, { booksHash: newBookHash });
    }
    return state;
}

function createBooksHash(booksArr){
    let result = {};
    booksArr.forEach(book => result[book._id] = book);
    return result;
}

const booksWithSubjectsSelector = createSelector(
    [state => state.books.booksHash, state => state.subjects.subjectHash],
    setBookResultsSubjects
);

const booksSelector = state => Object.assign({},
    state.books,
    {
        list: booksWithSubjectsSelector(state),
        selectedBooksCount: Object.keys(state.books.selectedBooks).filter(k => state.books.selectedBooks[k]).length
    });

module.exports = { booksReducer, booksSelector };