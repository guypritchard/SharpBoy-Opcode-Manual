import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import styles from './styles.module.css';

const InstructionCell = (props) => {
  const { instruction, setActiveInstruction, isMatch } = props;

  const z = instruction.flags.Z || '-';
  const n = instruction.flags.N || '-';
  let h = instruction.flags.H || '-';
  if (h === '8-bit' || h === '16-bit') {
    h = 'H';
  }
  let cy = instruction.flags.CY || '-';
  if (cy === '8-bit' || cy === '16-bit') {
    cy = 'CY';
  }

  const buttonRef = useRef(null);

  return (
    <td
      className={[
        styles.instruction,
        styles[instruction.type],
        isMatch ? styles.match : null,
      ].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        aria-label={`Opcode: 0x${instruction.opCode}; Instruction: ${instruction.mnemonic}`}
        onClick={() => setActiveInstruction(instruction, buttonRef)}
        ref={buttonRef}
        id={`opcode-${String(instruction.opCode).toLowerCase()}`}
        data-open-details="true"
        className="nes-btn"
      >
        <span className={styles.mnemonic}>{instruction.mnemonic}</span>
        <span className={styles.bytes}>{instruction.bytes}</span>
        <span className={styles.cycles}>{instruction.cycles}</span>
        <span className={styles.flags}>{`${z} ${n} ${h} ${cy}`}</span>
      </button>
    </td>
  );
};

export default InstructionCell;

InstructionCell.propTypes = {
  instruction: PropTypes.shape({
    mnemonic: PropTypes.string,
    type: PropTypes.string,
    bytes: PropTypes.number,
    cycles: PropTypes.string,
    flags: PropTypes.shape({
      Z: PropTypes.string,
      N: PropTypes.string,
      H: PropTypes.string,
      CY: PropTypes.string,
    }),
    opCode: PropTypes.string,
  }).isRequired,
  setActiveInstruction: PropTypes.func.isRequired,
  isMatch: PropTypes.bool,
};

InstructionCell.defaultProps = {
  isMatch: false,
};
