export default function canvasStyle() {
  return {
  mainWindow: {
    height: '100%',
    display: 'block',
  },
  controls: {
    position: 'absolute',
    left: '0px',
    top: '5px',
    zIndex: '10',
    fontSize: '12px',
    width: '32px',
    marginLeft: '20px',
    marginTop: '15px',
  },
  controlBtn: {
    backgroundColor: '#545555',
    padding: '5px 5px 2px 5px',
    borderRadius: '5px',
    marginBottom: '10px',
    '&:hover': {
      cursor: 'pointer',
    },
    '& img': {
      width: '22px',
      height: '22px',
    }
  }
  };
}
