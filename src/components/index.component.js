import React, { Component } from "react";
import Countdown from 'react-countdown';
import { useTable, useSortBy, useFilters, useGlobalFilter, useAsyncDebounce } from 'react-table'
import { matchSorter } from 'match-sorter'

//Component that is used to display the film cards

function Table({ columns, data }) {
    const defaultColumn = React.useMemo(
        () => ({
            // Let's set up our default Filter UI
            Filter: DefaultColumnFilter,
        }),
        []
    )

    function fuzzyTextFilterFn(rows, id, filterValue) {
        return matchSorter(rows, filterValue, { keys: [row => row.values[id]] })
    }
    function GlobalFilter({
        preGlobalFilteredRows,
        globalFilter,
        setGlobalFilter,
    }) {
        const count = preGlobalFilteredRows.length
        const [value, setValue] = React.useState(globalFilter)
        const onChange = useAsyncDebounce(value => {
            setGlobalFilter(value || undefined)
        }, 200)

        return (
            <span>
            </span>
        )
    }
    const filterTypes = React.useMemo(
        () => ({
            // Add a new fuzzyTextFilterFn filter type.
            fuzzyText: fuzzyTextFilterFn,
            // Or, override the default text filter to use
            // "startWith"
            text: (rows, id, filterValue) => {
                return rows.filter(row => {
                    const rowValue = row.values[id]
                    return rowValue !== undefined
                        ? String(rowValue)
                            .toLowerCase()
                            .startsWith(String(filterValue).toLowerCase())
                        : true
                })
            },
        }),
        []
    )

    function DefaultColumnFilter({
        column: { filterValue, preFilteredRows, setFilter },
    }) {
        const count = preFilteredRows.length

        return (
            <input
                value={filterValue || ''}
                onChange={e => {
                    setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
                }}
                placeholder={`Search`}
            />
        )
    }

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state,
        visibleColumns,
        preGlobalFilteredRows,
        setGlobalFilter,
    } = useTable(
        {
            columns,
            data,
            defaultColumn, // Be sure to pass the defaultColumn option
            filterTypes,
        },

        useFilters, // useFilters!

        useGlobalFilter,// useGlobalFilter!
        useSortBy,
    )

    // We don't want to render all 2000 rows for this example, so cap
    // it at 20 for this use case
    const firstPageRows = rows.slice(0, 20)

    return (
        <>
            <table {...getTableProps()} className="table table-striped">
                <thead>          {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps()}>

                                {/* Render the columns filter UI */}
                                <div>{column.canFilter ? column.render('Filter') : null}</div>
                            </th>
                        ))}
                    </tr>
                ))}

                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                // Add the sorting props to control sorting. For this example
                                // we can add them into the header props
                                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                    {column.render('Header')}
                                    {/* Add a sort direction indicator */}
                                    <span>
                                        {column.isSorted
                                            ? column.isSortedDesc
                                                ? ' 🔽'
                                                : ' 🔼'
                                            : ''}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {firstPageRows.map(
                        (row, i) => {
                            prepareRow(row);
                            return (
                                <tr {...row.getRowProps()}>
                                    {row.cells.map(cell => {
                                        return (
                                            <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                        )
                                    })}
                                </tr>
                            )
                        }
                    )}
                </tbody>
            </table>
        </>
    )
}

const User = (props) => (
    <tr>
        <td>{props.user.city}</td>
        <td>{props.user.state}</td>
        <td>{props.user.country}</td>
        <td>{props.user.name}</td>
        <td>{props.user.number}</td>
        <td>{props.user.latitude}</td>
        <td>{props.user.longitude}</td>
    </tr>
);

const renderer = ({ seconds, completed }) => {
    if (completed) {
        return <span>completed</span>;

    } else {
        // Render a countdown
        if (seconds == 1) {
            return <span>Reloading table in {seconds} second</span>;
        }
        else {
            return <span>Reloading table in {seconds} seconds</span>;
        }

    }
};

export default class Index extends Component {
    constructor(props) {

        super(props);

        this.updateUserList = this.updateUserList.bind(this);
        this.printUsers = this.printUsers.bind(this);
        this.reload = this.reload.bind(this);

        this.state = {
            users: [],
            query: "https://randomuser.me/api/?results=20",
            data: [],
            originalList: [],
            columns: [
                {
                    Header: 'Users',
                    columns: [
                        {
                            Header: 'city',
                            accessor: 'city',
                        },
                        {
                            Header: 'state',
                            accessor: 'state',
                        },
                        {
                            Header: 'country',
                            accessor: 'country',
                        },
                        {
                            Header: 'name',
                            accessor: 'name',
                        },
                        {
                            Header: 'number',
                            accessor: 'number',
                        },
                        {
                            Header: 'latitude',
                            accessor: 'latitude',
                        },
                        {
                            Header: 'longitude',
                            accessor: 'longitude',
                        }]
                }]
        };

    }

    componentDidMount() {
        this.updateUserList();
    }

    updateUserList() {
        this.setState({ data: [] });
        fetch(this.state.query)
            .then((users) => users.json())
            .then((list) => {
                {
                    list.results.map((user) => (
                        this.setState({ data: this.state.data.concat([{ "city": user.location.city, "state": user.location.state, "country": user.location.country, "name": user.location.street.name, "number": user.location.street.number, "latitude": user.location.coordinates.latitude, "longitude": user.location.coordinates.longitude }]), originalList: this.state.data })
                    ))
                }
            })
    }

    //Function that prints the users
    reload() {
        window.location.reload();
    }
    printUsers() {
        if (this.state.data !== undefined) {
            return this.state.data.map((currentUser) => {
                return <User user={currentUser} />;
            });
        }
    }
    render() {
        return (
            <div className="pl-3 pr-3 pt-2">
                <div className="d-flex justify-content-center align-items-center">
                    <h3 className="mt-3 mb-3 mr-3 mr-3">
                        <Countdown
                            date={Date.now() + 30000}
                            onComplete={() => this.reload()}
                            renderer={renderer}
                        />
                    </h3>
                    &nbsp;
                    <button className="btn btn-dark btn-sm d-block" onClick={() => this.updateUserList()}>Refresh</button>


                </div>


                <Table columns={this.state.columns} data={this.state.data} />
            </div>
        );
    }
}