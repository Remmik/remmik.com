import React from 'react';
import Helmet from 'react-helmet'

import './index.css'

class Index extends React.Component {
    render() {
        const siteTitle = 'Remmik.com';

        return (
            <div style={{ alignSelf: 'flex-start' }}>
                <Helmet title={siteTitle} />
                Remmik
            </div>
        )
    }
}

export default Index