import { filter, map, get, initial, last, reduce } from "lodash";
import React, { useMemo, useState, useEffect } from "react";
import Table from "antd/lib/table";
import Input from "antd/lib/input";
import InfoCircleFilledIcon from "@ant-design/icons/InfoCircleFilled";
import Popover from "antd/lib/popover";
import { RendererPropTypes } from "@/visualizations/prop-types";

import { prepareColumns, initRows, filterRows, sortRows } from "./utils";
import ColumnTypes from "./columns";

import "./renderer.less";
import NotEnoughData from '@/components/NotEnoughData';

function joinColumns(array: any, separator = ", ") {
  return reduce(
    array,
    (result, item, index) => {
      // @ts-expect-error ts-migrate(2365) FIXME: Operator '>' cannot be applied to types 'string' a... Remove this comment to see the full error message
      if (index > 0) {
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
        result.push(separator);
      }
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
      result.push(item);
      return result;
    },
    []
  );
}

function getSearchColumns(columns: any, { limit = Infinity, renderColumn = (col: any) => col.title } = {}) {
  const firstColumns = map(columns.slice(0, limit), col => renderColumn(col));
  const restColumns = map(columns.slice(limit), col => col.title);
  if (restColumns.length > 0) {
    return [...joinColumns(firstColumns), ` and ${restColumns.length} others`];
  }
  if (firstColumns.length > 1) {
    return [...joinColumns(initial(firstColumns)), ` and `, last(firstColumns)];
  }
  return firstColumns;
}

function SearchInputInfoIcon({ searchColumns }: any) {
  return (
    <Popover
      arrowPointAtCenter
      placement="topRight"
      content={
        <div className="table-visualization-search-info-content">
          Search {getSearchColumns(searchColumns, { renderColumn: col => <code key={col.name}>{col.title}</code> })}
        </div>
      }>
      <InfoCircleFilledIcon className="table-visualization-search-info-icon" />
    </Popover>
  );
}

type OwnSearchInputProps = {
  onChange?: (...args: any[]) => any;
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'searchColumns' does not exist on type 'S... Remove this comment to see the full error message
function SearchInput({ searchColumns, ...props }: SearchInputProps) {
  if (searchColumns.length <= 0) {
    return null;
  }

  const searchColumnsLimit = 3;
  return (
    <Input.Search
      {...props}
      placeholder={`Search ${getSearchColumns(searchColumns, { limit: searchColumnsLimit }).join("")}...`}
      suffix={searchColumns.length > searchColumnsLimit ? <SearchInputInfoIcon searchColumns={searchColumns} /> : null}
    />
  );
}

SearchInput.defaultProps = {
  onChange: () => {},
};

type SearchInputProps = OwnSearchInputProps & typeof SearchInput.defaultProps;

export default function Renderer({ options, data }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState([]);

  const searchColumns = useMemo(() => filter(options.columns, "allowSearch"), [options.columns]);

  const tableColumns = useMemo(() => {
    return prepareColumns(options.columns, orderBy, (newOrderBy: any) => {
      setOrderBy(newOrderBy);
      // Remove text selection - may occur accidentally
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      document.getSelection().removeAllRanges();
    });
  }, [options.columns, searchColumns, orderBy]);

  const preparedRows = useMemo(() => sortRows(filterRows(initRows(data.rows), searchTerm, searchColumns), orderBy), [
    data.rows,
    searchTerm,
    searchColumns,
    orderBy,
  ]);

  const specialKeyword = '<b>Total</b>'
  const mainRows = useMemo(() => preparedRows.filter((r: any) => !Object.values(r.record ?? {}).includes(specialKeyword)), [preparedRows]) as any[]
  const bottomRows = useMemo(() => preparedRows.filter((r: any) => Object.values(r.record ?? {}).includes(specialKeyword)), [preparedRows]) as any[]

  // If data or config columns change - reset sorting
  useEffect(() => {
    setOrderBy([]);
  }, [options.columns, data.columns]);

  if (mainRows.length === 0 && !searchTerm) {
    return <NotEnoughData />;
  }

  return (
    <div className="addressable-table-visualization-container">
      {
        searchColumns.length > 0 && (
          <div className="table-visualization-search">
            { /* @ts-expect-error ts-migrate(2322) FIXME: Type '(event: any) => void' is not assignable to t... Remove this comment to see the full error message */ }
            <SearchInput searchColumns={searchColumns} onChange={(event: any) => setSearchTerm(event.target.value)} />
          </div>
        )
      }
      <Table
        className="table-fixed-header"
        data-percy="show-scrollbars"
        data-test="TableVisualization"
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ key: any; dataIndex: string; align: any; s... Remove this comment to see the full error message
        columns={tableColumns}
        dataSource={mainRows}
        pagination={{
          size: get(options, "paginationSize", ""),
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'TablePagi... Remove this comment to see the full error message
          position: "bottom",
          pageSize: options.itemsPerPage,
          hideOnSinglePage: true,
          showSizeChanger: false,
        }}
        showSorterTooltip={false}
        summary={() => {
          return (
            <>
              {
                bottomRows.map((row, index) => (
                  <Table.Summary.Row key={index}>
                    {
                      tableColumns.map((col: any, index) => {
                        const com = col.render(row, row)
                        return (
                          <Table.Summary.Cell key={index} index={index} className={com.props?.className ?? ''}>
                            <span style={{ textAlign: col.align, display: 'block' }}>
                              {com.children}
                            </span>
                          </Table.Summary.Cell>
                        )
                      })
                    }
                  </Table.Summary.Row>
                ))
              }
            </>
          );
        }}
      />
    </div>
  );
}

Renderer.propTypes = RendererPropTypes;
