import React from 'react';


export default function TableData(props) {
    console.log(props)
    return (
        <table className="table table-striped">
            <thead>
                <tr>
                    {
                        props.data.headers.map((head, index) => {
                            return <th key={index}>{head}</th>;
                        })
                    }
                </tr>
            </thead>
            <tbody>
                {
                    props.data.rows.map(row => {
                        return (
                            <tr key={row.id}>
                                {
                                    row.cols.map(col => {
                                        return (
                                            <td key={col.id}>
                                                {col.data}
                                            </td>
                                        )
                                    }
                                    )
                                }
                            </tr>
                        )
                    }
                    )
                }
            </tbody>
        </table>
    );
}