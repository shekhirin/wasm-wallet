import {Wallet} from "./pkg"
import React from "react"
import {utils, BigNumber} from "ethers"


interface Props {
    wallet: Wallet
}

interface State {
    balance?: BigNumber
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
        return <span>Balance: {this.state.balance ? utils.formatEther(this.state.balance) : ''}</span>
    }
}
