import 'smart-webcomponents-react/source/styles/smart.default.css';
import { Grid } from 'smart-webcomponents-react/grid';

export default function PivotTableComponent() {
    const behavior = {
        columnResizeMode: 'growAndShrink'
    }

    const appearance = {
        alternationCount: 2,
        showRowHeader: true,
        showRowHeaderSelectIcon: true,
        showRowHeaderFocusIcon: true
    }

    const paging = {
        enabled: true
    }

    const pager = {
        visible: true
    }

    const sorting = {
        enabled: true
    }

    const editing = {
        enabled: true
    }

    const selection = {
        enabled: true,
        allowCellSelection: true,
        allowRowHeaderSelection: true,
        allowColumnHeaderSelection: true,
        mode: 'extended'
    }

    const dataSource = [
        { "firstName": "Beate", "lastName": "Wilson", "productName": "Caramel Latte" },
        { "firstName": "Ian", "lastName": "Nodier", "productName": "Caramel Latte" },
        { "firstName": "Petra", "lastName": "Vileid", "productName": "Green Tea" },
        { "firstName": "Mayumi", "lastName": "Ohno", "productName": "Caramel Latte" },
        { "firstName": "Mayumi", "lastName": "Saylor", "productName": "Espresso con Panna" },
        { "firstName": "Regina", "lastName": "Fuller", "productName": "Caffe Americano" },
        { "firstName": "Regina", "lastName": "Burke", "productName": "Caramel Latte" },
        { "firstName": "Andrew", "lastName": "Petersen", "productName": "Caffe Americano" },
        { "firstName": "Martin", "lastName": "Ohno", "productName": "Espresso con Panna" },
        { "firstName": "Beate", "lastName": "Devling", "productName": "Green Tea" },
        { "firstName": "Sven", "lastName": "Devling", "productName": "Espresso Truffle" },
        { "firstName": "Petra", "lastName": "Burke", "productName": "Peppermint Mocha Twist" },
        { "firstName": "Marco", "lastName": "Johnes", "productName": "Caffe Mocha" }
    ]

    const columns = [{
        label: 'First Name',
        dataField: 'firstName'
    },
    {
        label: 'Last Name',
        dataField: 'lastName'
    },
    {
        label: 'Product',
        dataField: 'productName'
    }
    ]


    return (
        <div>
            <div>The Grid in this demo displays data in a series of rows and columns. This
                is the simplest case when the Grid is bound to a local data source.</div>
            <Grid
                dataSource={dataSource}
                columns={columns}
                appearance={appearance}
                behavior={behavior}
                selection={selection}
                paging={paging}
                pager={pager}
                sorting={sorting}
                editing={editing}
            >
            </Grid>
        </div>
    );
}
