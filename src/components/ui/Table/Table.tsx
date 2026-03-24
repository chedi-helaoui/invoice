import React from 'react';
import styles from './Table.module.scss';

export interface Column<T> {
  header: string;
  accessor: string | keyof T | ((row: T) => React.ReactNode);
  isNumeric?: boolean;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
}

export default function Table<T>({ data, columns, keyExtractor }: TableProps<T>) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className={col.isNumeric ? styles.numericCell : ''}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={keyExtractor(row)}>
              {columns.map((col, colIndex) => (
                <td 
                  key={colIndex}
                  className={col.isNumeric ? styles.numericCell : ''}
                >
                  {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor as keyof T] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
