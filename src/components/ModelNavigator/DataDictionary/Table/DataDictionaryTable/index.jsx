import React, {useContext} from 'react';
import withStyles from '@mui/styles/withStyles';
import './DataDictionaryTable.css';
// import {
//   createFileName,
// } from '../../utils';
import { ModelContext } from '../../../Model/ModelContext';
import DataDictionaryCategory from '../DataDictionaryCategory';

const DataDictionaryTable = ({
  classes,
  dictionaryName,
  // pdfDownloadConfig,
}) => {
  const model = useContext( ModelContext );
  return (
    <>
      <p className={classes.tableInfo}>
        <span>{dictionaryName}</span>
        <span> Model has </span>
        <span>{model.nodes().length}</span>
        <span> nodes and </span>
        <span>{model.props().length}</span>
        <span> properties </span>
      </p>
      <div className={classes.tableBody}>
        { model.tag_kvs('Category').length > 0
          ? model.tag_kvs('Category').map(([,category]) => (
            <DataDictionaryCategory
              key={category}
              nodes={model.tagged_items('Category', category)}
              category={category}
            />
          ))
          : (
              <DataDictionaryCategory
                nodes={model.nodes()}
                category="Nodes"
              />
          )
        }
      </div>
    </>
  );
};

const styles = () => ({
  tableBody: {
  },
  tableInfo: {
    marginTop: '0',
    marginBottom: '0',
    marginLeft: '15px',
    color: '#32495A',
    fontFamily: 'Lato',
    fontSize: '14px',
    letterSpacing: '0',
    lineHeight: '26.06px',
  },
});

export default withStyles(styles)(DataDictionaryTable);
