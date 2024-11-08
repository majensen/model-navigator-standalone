export default function nodeViewComponentStyle()  {
  return {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "2em",
    width: "100%",
    "&:hover $nodeTitle": {
      color: "#3283c8",
    },
  },
  titleAndDescContainer: {
    display: "flex",
  },
  tagsAndDescriptionContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "34px",
    width: "100%",
    paddingRight: "5px",
  },
  tagsAndBtnContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  assignmentAndClassTags: {
    display: "flex",
    gap: "15px",
  },
  overlaySpacer: {
    width: "74px",
  },
  spacer: {
    width: "45px",
  },
  nodeTitle: {
    width: "260px",
    flexGrow: "0",
    flexShrink: "0",
    "-moz-user-select": "none",
    "-webkit-user-select": "none",
    fontWeight: "700",
    "-ms-user-select": "none",
    userSelect: "none",
    fontSize: "15px",
    fontFamily: "Nunito",
    lineHeight: "14px",
    "&:hover": {
      color: "#3283c8",
    },
  },
  nodeDescription: {
    paddingRight: "33px",
    fontSize: "14px",
    fontFamily: "Nunito",
    lineHeight: "17px",
    fontWeight: "300",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "#4A4A4A",
    textAlign: "justify",
    margin: "0px",
  },
  propertyCountBtn: {
    width: "150px",
    height: "26px",
    backgroundColor: "#F3F8FB",
    textTransform: "capitalize",
    color: "#000000",
    borderRadius: "0px",
  },
  nodeLabel: {
    color: "#000000",
    padding: "0 17px",
    borderRadius: "100px",
    border: "1px solid #cdcdcd",
    background: "#fff",
    fontSize: "12px",
    height: "22px",
    width: "136px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "5px",
  },
  nodeAssignment: {
    color: "#036077",
    fontWeight: "600",
    fontFamily: "Nunito",
  },
  nodeClass: {
    color: "#036077",
    fontWeight: "600",
    fontFamily: "Nunito",
  },
  };
}

