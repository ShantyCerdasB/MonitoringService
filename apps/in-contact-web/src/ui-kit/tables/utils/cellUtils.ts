/**
 * @fileoverview Cell utilities - Helper functions for formatting table cell values
 * @summary Utility functions for formatting and rendering table cell values
 * @description Provides functions to format cell values for display in table cells
 */

import type React from 'react';
import type { IColumn } from '../types';

/**
 * Formats a cell value for display
 * 
 * Converts various value types to strings suitable for display:
 * - null/undefined -> empty string
 * - strings -> returned as-is
 * - objects -> JSON stringified
 * - other types -> converted to string
 * 
 * @param value - Value to format
 * @returns Formatted string value
 */
export function formatCellValue(value: unknown): string {
  if (value == null) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * Gets cell value from row data based on column key
 * 
 * Handles both string keys and keyof T keys, returning the appropriate value.
 * 
 * @template T Row data type
 * @param row - Row data object
 * @param col - Column definition
 * @returns Cell value or null if not found
 */
export function getCellValue<T>(row: T, col: IColumn<T>): unknown {
  if (!col.key) {
    return null;
  }

  if (typeof col.key !== 'string') {
    return row[col.key as keyof T];
  }

  if (col.key in (row as Record<string, unknown>)) {
    return (row as Record<string, unknown>)[col.key];
  }

  return null;
}

/**
 * Renders cell content based on column definition
 * 
 * Uses custom render function if provided, otherwise formats the cell value
 * based on the column key.
 * 
 * @template T Row data type
 * @param row - Row data object
 * @param col - Column definition
 * @returns React node to render in the cell
 */
export function renderCellContent<T>(row: T, col: IColumn<T>): React.ReactNode {
  if (col.render) {
    return col.render(row);
  }

  if (!col.key) {
    return '';
  }

  const value = getCellValue(row, col);
  return formatCellValue(value);
}

