import React from 'react';
import Product from './Product'

class App extends React.Component {
	render() {
		return <React.Fragment>
			<header>
				{/* Roboto for use with Material UI */}
				<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
			</header>
			<Product/>
		</React.Fragment>
	}
}

export default App;
