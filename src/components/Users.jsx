import axios from 'axios';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Users(props) {
  const [filter, setFilter] = useState('');
  const [transactions, setTransactions] = useState([]);


  async function getData() {
    const response = await axios.get("http://localhost:4000/customers");
    console.log("Customers data:", response.data);
    return response.data;
  }
  const { data: customersData, isLoading: customersLoading } = useQuery("customers", getData);
  async function getTra() {
    const response = await axios.get("http://localhost:4000/transactions");
    console.log("Transactions data:", response.data);
    return response.data;
  }
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery("transactions", getTra);


  const customersWithTransactions = (customersData || []).map(customer => {
    const customerTransactions = (transactionsData || []).filter(
      transaction => transaction.customer_id === customer.id
    );
    return { ...customer, transactions: customerTransactions };
  });


  const filteredCustomers = customersWithTransactions.filter(customer => {
    const transactionsMatch = customer.transactions.some(transaction => 
      transaction.date.includes(filter) || transaction.amount.toString().includes(filter)
    );
    return customer.name.toLowerCase().includes(filter) || transactionsMatch;
  });

  if (customersLoading || transactionsLoading) {
    return <div>Loading...</div>;
  }
  const fetchCustomerId = async (customer) => {
    try {
      const {data} = await axios.get(`http://localhost:4000/transactions?customer_id=${customer.customer_id}`);
      console.log(data,"data");
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching Customer ID:', error);
  }
  };
const lineData = {
  labels: transactions.map((t) => t.date),
  datasets: [
    {
      label: 'Transaction Amount (Line)',
      data: transactions.map((t) => t.amount),
      backgroundColor: [
        'rgba(75,192,192,1)',
        '#ecf0f1',
        '#50AF95',
        '#f3ba2f',
        '#2a71d0',
      ],
      borderColor: 'black',
      borderWidth: 2,
    },
  ],
};

const barData = {
  labels: transactions.map((t) => t.date),
  datasets: [
    {
      label: 'Transaction Amount (Bar)',
      data: transactions.map((t) => t.amount),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(201, 203, 207, 0.8)',
      ],
      borderColor: 'rgba(0,0,0,1)',
      borderWidth: 2,
    },
    ],
  };
  return (
    <div className='width'>
      <input
        type="text"
        placeholder="Filter by name, date or amount"
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />
      <table border={1} width={300}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map(customer =>
            customer.transactions.map(transaction => (
              <tr key={transaction.id}   onClick={() =>fetchCustomerId(transaction)}>
                <td>{customer.name}</td>
                <td>{transaction.date}</td>
                <td>{transaction.amount}</td>
                
              </tr>
            ))
          )}
        </tbody>
      </table>
      <br />
      <br />
      <br />
      <div className="d-flex">
      <Line data={lineData}/>
      <Bar data={barData} />
      </div>
    </div>
  );
}

export default Users;
