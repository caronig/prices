import React from 'react';
import { Select, MenuItem, TextField, Grid, Button, Paper, Typography } from '@material-ui/core/';
import Chart from 'chart.js';

class PriceHistory extends React.Component {

    baseUrl = 'http://localhost:8000/sales/products/';

    constructor(props) {
        super(props);
        this.state = {
            selectedProductPrices: [],
            selectedProductNewPrice: '',
            //not bother the user with required inputs until he or she clicks 'add product'
            shouldValidate: false
        };
        //this ref will be used to draw the graphic
        this.chartRef = React.createRef();
    }

    componentDidMount() {
        this.loadProductPrices();
    }

    componentDidUpdate(prevProps) {
        if( this.props.selectedProduct !== prevProps.selectedProduct ) {
            this.loadProductPrices();
        }
    }

    loadProductPrices = () => {
        if( this.props.selectedProduct !== '' ) {
            fetch(this.baseUrl + this.props.selectedProduct + '/prices')
            .then(response => response.json())
            .then(responseData => {
                this.setState( { selectedProductPrices: responseData, shouldValidate: false } );
                this.makeGraphic(responseData);
            });
        }
    }

    priceError = () => {
        if ( this.state.shouldValidate && this.state.selectedProductNewPrice === '' ) {
            return 'Price is required';
        }
        else if ( this.state.shouldValidate && Number(this.state.selectedProductNewPrice ) <= 0 ) {
            return 'Price should be positive';
        }
        return '';
    }

    updatePrice = () => {
        this.setState( 
            { shouldValidate: true },
            //wait for the state to be updated and then perform the validation
            () => {
                if( !this.priceError() ) {
                    const body = { price: Number(this.state.selectedProductNewPrice) };
                    fetch( this.baseUrl + this.props.selectedProduct + '/prices',
                        {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(body)
                        }
                    )
                    .then(response => response.json())
                    .then(responseData => {
                        this.loadProductPrices();
                    });
                }
            }
        );
    }

    handleInputChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    render() {
        let options = [];
        this.props.products.forEach(product => {
            options.push(<MenuItem value={product.id} key={product.id}>{product.name}</MenuItem>);
        });
        return <div>
            <Paper elevation={1} height={200}  style={{ padding: 10 }}>
                <Typography variant="h5">Price history</Typography>
                <Grid container spacing={1} justify="center" style={{ padding: 10 }}>
                    <Grid item xs={4}>
                        <Select
                            variant="outlined"
                            name="selectedProduct"
                            value={this.props.selectedProduct}
                            color="primary"
                            onChange={this.props.onProductChange}>
                                {options}
                        </Select>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            name="selectedProductNewPrice"
                            label="Price"
                            required
                            helperText={this.priceError()}
                            error={this.priceError() !== ''}
                            type="number"
                            value={this.state.selectedProductNewPrice}
                            onChange={this.handleInputChange}>
                        </TextField>
                    </Grid>
                    <Grid item xs={4}>
                        <Button variant="contained" color="primary" onClick={this.updatePrice}>Update price</Button>
                    </Grid>
                </Grid>
                <Grid container justify="center" style={{ padding: 10 }}>
                    <Grid item xs={8}>
                        <canvas ref={this.chartRef}/>
                    </Grid>
                </Grid>
            </Paper>
        </div>
    }

    makeGraphic = (prices) => {
        if( prices && prices.length > 0) {
            let datesArray = [];
            let pricesArray = [];
            prices.forEach(priceRow => {
                datesArray.push(new Date(priceRow.date));
                pricesArray.push(priceRow.price);
            });

            const labels = datesArray;

            const data = {
                labels: labels,
                datasets: [{
                    label: 'Price',
                    backgroundColor: 'rgb(63, 81, 181)',
                    borderColor: 'rgb(63, 81, 181)',
                    data: pricesArray,
                }]
            };

            const config = {
                type: 'line',
                data,
                options: {
                    scales: {
                        xAxes: [{
                            type: 'time',
                            //distribution: 'series',
                            time: {
                                unit: 'day'
                            }
                        }]
                    }
                }
            };

            if(this.myChart) this.myChart.destroy();

            this.myChart = new Chart(
                this.chartRef.current,
                config
            );
        }
    }
}

export default PriceHistory;
