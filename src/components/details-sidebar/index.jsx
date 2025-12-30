import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.css';

const DetailsSidebar = ({
  activeInstruction: {
    mnemonic,
    opCode,
    bytes,
    cycles,
    flags: {
      Z,
      N,
      H,
      CY,
    },
    description,
  },
  hideSidebar,
  isHidden,
  sidebarRef,
  sidebarContainerRef,
}) => (
  <aside
    aria-label="Opcode details"
    className={[
      styles.sidebar,
      isHidden ? styles.hidden : null,
    ].filter(Boolean).join(' ')}
    id="details-sidebar"
    ref={sidebarContainerRef}
  >
    <div id="sidebar-header" className={styles.header}>
      <h2
        className={styles.title}
        ref={sidebarRef}
        tabIndex={-1}
      >
        {mnemonic}
      </h2>
      <button
        id="close-sidebar"
        type="button"
        aria-label="close details sidebar"
        onClick={hideSidebar}
        className={`${styles.close} nes-btn is-error`}
      >
        Close
      </button>
    </div>
    <section>
      <ul className={styles.metaList}>
        <li>{`Opcode: 0x${opCode}`}</li>
        <li>{`Number of Bytes: ${bytes}`}</li>
        <li>{`Number of Cycles: ${cycles}`}</li>
        <li>{`Flags: ${Z || '-'} ${N || '-'} ${H || '-'} ${CY || '-'}`}</li>
      </ul>
    </section>
    <section aria-label="description">
      <h3 className={styles.sectionTitle}>Description</h3>
      {description || <p>Coming Soon</p>}
    </section>
  </aside>
);

export default DetailsSidebar;

DetailsSidebar.propTypes = {
  activeInstruction: PropTypes.shape({
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
    description: PropTypes.element,
  }).isRequired,
  hideSidebar: PropTypes.func.isRequired,
  isHidden: PropTypes.bool.isRequired,
  sidebarRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({
      current: PropTypes.instanceOf(Element),
    }),
  ]).isRequired,
  sidebarContainerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({
      current: PropTypes.instanceOf(Element),
    }),
  ]).isRequired,
};
