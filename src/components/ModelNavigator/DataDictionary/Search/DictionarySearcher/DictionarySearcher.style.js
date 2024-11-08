export default function dictionarySearcherStyle() {
  return {
  searcher: {
    paddingTop: "0px",
    minHeight: 168,
  },
  result: {
    margin: "10px 0",
  },
  resultText: {
    display: "inline",
  },
  resultItem: {
    marginBottom: "8px",
    marginTop: "5px",
    fontFamily: "Nunito",
    fontSize: "14px",
    fontWeight: "200",
    letterSpacing: "0",
    lineHeight: "15px",
  },
  resultList: {
    paddingTop: "15px",
    paddingBottom: "20px",
  },
  resultCountTitleDesc: {
    height: "35px",
    width: "25px",
    color: "#0D71A3",
    lineHeight: "22px",
  },
  resultCountProps: {
    width: "25px",
    color: "#0D71A3",
  },
  resultClear: {
    cursor: "pointer",
    float: "right",
    "&:hover": {},
  },
  searchBarTitle: {
    backgroundColor: "#2F75C6",
    paddingTop: "15px",
    paddingBottom: "13px",
    paddingLeft: "33px",
    borderTopRightRadius: "7px",
  },
  searchBarTitleText: {
    height: "15px",
    color: "#FFFFFF",
    fontFamily: "Lato",
    fontSize: "18px",
    fontWeight: "bold",
  },
  searchInput: {
    width: "100%",
    textAlign: "right",
    boxSizing: "border-box",
    border: "1px solid #000000",
    backgroundColor: "#0f4c91",
    paddingTop: "15px",
    paddingLeft: "10px",
    height: "120px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  resultClearBtn: {
    float: "right",
  },
  searchResultText: {
    // textAlign: 'center',
    paddingLeft: "20%",
    paddingTop: "20px",
    height: "12px",
    color: "#323232",
    fontFamily: "Raleway",
    fontSize: "15px",
    fontWeight: "600",
    lineHeight: "18px",
  },
  results: {
    //    paddingTop: "20px",
    //   minHeight: "40px",
  },
  clearAllButtonRoot: {
    marginRight: "13px",
    marginBottom: "12px",
  },
    customButton: {
      alignSelf: "end",
      width: 80,
      height: 22,
      borderRadius: "100px",
      minHeight: "20px",
      fontSize: 9,
      padding: 1,
      fontFamily: "Open Sans",
      textTransform: "none",
      color: "#000000",
      background: "#fff",
      "& .Button:hover": {
        backgroundColor: "#D3D3D3",
        color: "#000",
      },
    },
  };
}

