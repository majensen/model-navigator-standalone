export default () => ({
  legendExpand: {
    position: 'absolute',
    right: '12px',
    top: '400px',
    backgroundColor: '#494949',
    border: '2px solid #5486AF',
    borderTopLeftRadius: '10px 10px',
    borderBottomLeftRadius: '10px 10px',
    paddingBottom: '15px',
  },
  zvlaue: {
    zIndex: '10',
  },
  legendCollapse: {
    position: 'absolute',
    right: '12px',
    top: '400px',
    backgroundColor: '#18588C',
    border: '1px solid #125C5D',
    borderTopLeftRadius: '10px 10px',
    borderBottomLeftRadius: '10px 10px',
  },
  headerExpand: {
    boxSizing: 'border-box',
    height: '46px',
    paddingTop: '10px',
    paddingRight: '15px',
    paddingLeft: '15px',
    maxWidth: '228px',
    backgroundColor: '#343434',
    borderTopLeftRadius: '10px 10px',
  },
  headerCollapse: {
    boxSizing: 'border-box',
    height: '45px',
    paddingTop: '10px',
    paddingRight: '15px',
    paddingLeft: '15px',
    width: '62px',
    borderTopLeftRadius: '10px 10px',
    borderBottomLeftRadius: '10px 10px',
    width: '62px',
    backgroundColor: '#18588C',
  },
  collapse: {
    backgroundColor: 'unset',
    minWidth: 'unset',
    padding: '0',
    border: 'none',
  },
  category: {
    lineHeight: '20px',
    verticalAlign: 'middle',
    display: 'flex',
    height: '38px',
    paddingLeft: '22px',
  },
  circleWrapper: {
    display: 'block',
    height: '20px',
  },
  circle: {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
  },
  text: {
    marginLeft: '15px',
    color: '#ffffff',
    fontFamily: 'Lato',
    fontSize: '13px',
    letterSpacing: '0',
    lineHeight: '18px',
    wordBreak: 'break-all',
    display: 'block',
    margin: 'auto',
    textTransform: 'lowercase',
  },
  item: {
    lineHeight: '20px',
    verticalAlign: 'middle',
    marginBottom: '2px',
    display: 'flex',
    paddingLeft: '20px',
    paddingTop: '10px',
  },
  toggleBtn: {
    float: 'right',
    cursor: 'pointer',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Lato',
    fontSize: '18px',
    fontWeight: '500',
    paddingTop: '8px',
    marginRight: '30px',
  },
  categoryIcon: {
    paddingTop: '5px',
  }
});
