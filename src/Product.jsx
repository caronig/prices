import React from 'react';
import { TextField, Grid, Button, Paper, Typography } from '@material-ui/core/';
import PriceHistory from './PriceHistory'

class Product extends React.Component {

    baseUrl = 'http://localhost:8000/sales/products/';

    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            products: [],
            selectedProduct: '',
            newProductName: '',
            newProductPrice: '',
            //not bother the user with required inputs until he or she clicks 'add product'
            shouldValidate: false
        };
    }

    componentDidMount() {
        this.loadProducts();
    }

    loadProducts = () => {
        fetch(this.baseUrl).then(response => response.json())
        .then(products => {
            let selectedProduct = this.state.selectedProduct;
             
            //preselect the first item
            if (products.length > 0 && this.state.selectedProduct === '') {
                selectedProduct = products[0].id;
            }

            this.setState(
                {
                    products: products,
                    loaded: true,
                    selectedProduct: selectedProduct
                }
            );
        });
    }

    addProduct = () => {
        this.setState( 
            { shouldValidate: true },
            //wait for the state to be updated and then perform the validation
            () => {
                if( !this.nameError() && !this.newProductPriceError() ) {
                    const body = { name: this.state.newProductName };
                    fetch( this.baseUrl,
                        {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(body)
                        }
                    )
                    .then(response => response.json())
                    .then(responseData => {
                        const { id } = responseData;
                        const bodyPrice = { price: Number(this.state.newProductPrice) };
                        fetch( this.baseUrl + id + '/prices',
                            {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify(bodyPrice)
                            }
                        )
                        .then(response => response.json())
                        .then(responseData => {
                            this.setState( {selectedProduct: id} );
                            this.loadProducts();
                        });
                    });
                }
            }
        )
    }

    handleInputChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    handleProductChange = (event) => {
        this.setState( {selectedProduct: event.target.value} );
    }

    nameError = () => {
        if ( this.state.shouldValidate && this.state.newProductName === '' ) {
            return 'Name is required';
        }
        return '';
    }

    newProductPriceError = () => {
        if ( this.state.shouldValidate && this.state.newProductPrice === '' ) {
            return 'Price is required';
        }
        return '';
    }

    makeProductForm = () => {
        return <div>
            <Paper elevation={1} height={200} style={{ padding: 10 }}>
                <Typography variant="h5">New Product</Typography>
                <Grid container spacing={1} justify="center" style={{ padding: 10 }}>
                    <Grid item xs={4}>
                        <TextField
                            required
                            helperText={this.nameError()}
                            error={this.nameError() !== ''}
                            name="newProductName"
                            label="New product name"
                            value={this.state.newProductName}
                            onChange={this.handleInputChange}>
                        </TextField>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            required
                            helperText={this.newProductPriceError()}
                            error={this.newProductPriceError() !== ''}
                            name="newProductPrice"
                            label="New product price"
                            type="number"
                            value={this.state.newProductPrice}
                            onChange={this.handleInputChange}>
                        </TextField>
                    </Grid>
                    <Grid item xs={4}>
                        <Button variant="contained" color="primary" onClick={this.addProduct}>Add new product</Button>
                    </Grid>
                </Grid>
            </Paper>
            <PriceHistory products={this.state.products} selectedProduct={this.state.selectedProduct} onProductChange={this.handleProductChange}/>
        </div>;
    }

    render() {
        const { loaded } = this.state;
        if ( !loaded ) {
            return (<Typography variant="h5">Loading...</Typography>);
        }
        return this.makeProductForm();
    }

}

export default Product;
