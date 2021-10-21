import {Wallet} from "./pkg"
import React from "react"


interface Props {
    wallet: Wallet
}

interface State {
    address?: String
}

export default class extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)

        this.state = {}
        this.updateAddress()
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        if (prevProps.wallet !== this.props.wallet) {
            this.setState({address: undefined}, this.updateAddress)
        }
    }

    updateAddress() {
        this.props.wallet.address()
            .then(address => {
                this.setState({address: address})
            })
            .catch(error => console.log(error))
    }

    render() {
        return <span>Address: {this.state.address}</span>
    }
}
