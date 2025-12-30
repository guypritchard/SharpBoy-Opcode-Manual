import React from 'react';
import PropTypes from 'prop-types';
import InstructionCell from '../instruction-cell';

import styles from './styles.module.css';

const OpCodeTable = ({
  opCodesGrid,
  caption,
  setActiveInstruction,
  matchedOpCodesSet,
  hideNonMatches,
  searchQuery,
  activeRowIndex,
  activeColumnIndex,
  isActiveTable,
}) => (
  <div className={styles.wrapper}>
    <table className={styles.table}>
      <caption className={styles.caption}>{caption}</caption>
      <tbody>
        <tr>
          <td className={styles.corner} />
          {Array(16)
            .fill('')
            .map((value, index) => (
              <th
                className={[
                  styles.colHeader,
                  isActiveTable && activeColumnIndex === index ? styles.colHeaderActive : null,
                ].filter(Boolean).join(' ')}
                scope="col"
                key={`x${index.toString()}`}
              >
                {`x${index.toString(16).toUpperCase()}`}
              </th>
            ))}
        </tr>
        {opCodesGrid.map((gridRow, rowIndex) => (
          <tr key={`${rowIndex.toString(16)}x`}>
            <th
              className={[
                styles.rowHeader,
                isActiveTable && activeRowIndex === rowIndex ? styles.rowHeaderActive : null,
              ].filter(Boolean).join(' ')}
              scope="row"
            >
              {`${rowIndex.toString(16).toUpperCase()}x`}
            </th>
            {gridRow.map((gridCell, columnIndex) => {
              const cellKey = `${rowIndex}${columnIndex}`;
              const hasInstruction = Object.keys(gridCell).length > 0;

              if (!hasInstruction) {
                return <td key={cellKey} className={styles.emptyCell} />;
              }

              const opcodeKey = (gridCell.opCode || '').toLowerCase();
              const isMatch = Boolean(searchQuery)
                && matchedOpCodesSet
                && matchedOpCodesSet.has(opcodeKey);

              if (hideNonMatches && searchQuery && !isMatch) {
                return <td key={cellKey} className={styles.emptyCell} />;
              }

              return (
                <InstructionCell
                  key={cellKey}
                  instruction={gridCell}
                  isMatch={isMatch}
                  setActiveInstruction={setActiveInstruction}
                />
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default OpCodeTable;

OpCodeTable.propTypes = {
  opCodesGrid: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.shape({})),
  ).isRequired,
  caption: PropTypes.string.isRequired,
  setActiveInstruction: PropTypes.func.isRequired,
  matchedOpCodesSet: PropTypes.instanceOf(Set),
  hideNonMatches: PropTypes.bool,
  searchQuery: PropTypes.string,
  activeRowIndex: PropTypes.number,
  activeColumnIndex: PropTypes.number,
  isActiveTable: PropTypes.bool,
};

OpCodeTable.defaultProps = {
  matchedOpCodesSet: null,
  hideNonMatches: false,
  searchQuery: '',
  activeRowIndex: null,
  activeColumnIndex: null,
  isActiveTable: false,
};
