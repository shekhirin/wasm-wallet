import {Wallet} from "./pkg"
import React from "react"
import BN from "bn.js"
// @ts-ignore
import ethjsUnit from "ethjs-unit"


interface Props {
    wallet: Wallet
}

interface State {
    balance?: BN
}

export default class extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)

        this.state = {}
        this.updateBalance()
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        if (prevProps.wallet !== this.props.wallet) {
            this.setState({balance: undefined}, this.updateBalance)
        }
    }

    updateBalance() {
        this.props.wallet.balance()
            .then(balance => {
                this.setState({balance: balance})
            })
            .catch(error => console.log(error))
    }

    render() {
        return <span>Balance: {this.state.balance ? ethjsUnit.fromWei(this.state.balance, 'ether') : ''}</span>
    }
}
