import React from "react"
import {Wallet} from "./pkg"
import BN from "bn.js"


interface Props {
    wallet: Wallet
}

interface State {
    address?: string
    amount?: string
}

export default class extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)

        this.state = {}
    }

    async handleSend(e: React.FormEvent) {
        e.preventDefault()

        if (this.state.amount) {
            const amount = new BN(this.state.amount, 10)
            console.log(await this.props.wallet.send(this.state.address, amount))
        }
    }

    render() {
        return <form onSubmit={this.handleSend.bind(this)}>
            <input placeholder="recipient" type="text" onChange={e => this.setState({address: e.target.value || undefined})}/>
            <input placeholder="amount in wei" type="number" onChange={e => this.setState({amount: e.target.value})}/>
            <input disabled={!this.state.amount} type="submit" value="Send"/>
        </form>
    }
}
