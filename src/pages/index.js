import React from 'react';
import Helmet from 'react-helmet'

import './index.css'

class Index extends React.Component {
    render() {
        const siteTitle = 'Remmik.com';

        return (
            <div style={{ alignSelf: 'flex-start' }}>
                <Helmet title={siteTitle} />
                <h1 className="title">Remmik</h1>
                <p className="info">CVR: 39483882 <span className="seperator">&bull;</span> <a href="tel:+45585080">+45 31 58 50 80</a></p>
            </div>
        )
    }
}

export default Index