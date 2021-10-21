import {Chain, Wallet} from "./pkg"

import React from 'react'
import ReactDOM from 'react-dom'
import Address from "./Address"
import Balance from "./Balance"
import Send from "./Send"

type Wasm = typeof import('./pkg')

interface AppProps {
    wasm: Wasm
}

interface AppState {
    loading: boolean
    chain: Chain
    mnemonic: string
    loggedIn: boolean
    wallet?: Wallet
}

class App extends React.Component<AppProps, AppState> {
    constructor(props: Readonly<AppProps> | AppProps) {
        super(props)

        this.state = {
            loading: true,
            mnemonic: '',
            loggedIn: false,
            chain: Chain.Ropsten
        }

        chrome.storage.local.get(['mnemonic', 'chain'], value => {
            const mnemonic = value.mnemonic
            const chain = value.chain

            if (mnemonic !== undefined && chain !== undefined) {
                this.setState({
                        mnemonic: mnemonic || this.state.mnemonic,
                        chain: chain || this.state.chain
                    },
                    () =>
                        this.connect(() =>
                            this.setState({loading: false})
                        )
                )
            } else {
                this.setState({loading: false})
            }
        })
    }

    connect(callback?: () => void) {
        this.props.wasm.connect(this.state.chain, this.state.mnemonic)
            .then(wallet => {
                this.setState({loggedIn: true, wallet: wallet})

                callback?.()
            })
            .catch(error => console.log(error))
    }

    async handleLogin(e: React.FormEvent) {
        e.preventDefault()

        await chrome.storage.local.set({mnemonic: this.state.mnemonic, chain: this.state.chain})
        this.connect()
    }

    async handleChain(e: React.ChangeEvent<HTMLSelectElement>) {
        e.preventDefault()

        this.setState(
            {
                chain: Number.parseInt(e.target.value) as Chain,
                wallet: undefined
            },
            () =>
                this.connect(async () =>
                    await chrome.storage.local.set({chain: this.state.chain})
                )
        )
    }

    render() {
        return <div hidden={this.state.loading}>
            <form hidden={this.state.loggedIn} onSubmit={this.handleLogin.bind(this)}>
                <input placeholder="mnemonic" type="text" onChange={e => this.setState({mnemonic: e.target.value})}/>
                <input type="submit" value="Login"/>
            </form>
            <select disabled={!this.state.wallet} value={this.state.chain} onChange={this.handleChain.bind(this)}>
                {/*<option value={Chain.Mainnet}>Mainnet</option>*/}
                <option value={Chain.Ropsten}>Ropsten</option>
                <option value={Chain.Kovan}>Kovan</option>
                <option value={Chain.Rinkeby}>Rinkeby</option>
                <option value={Chain.Goerli}>Goerli</option>
                <option value={Chain.Ganache}>Ganache</option>
            </select>

            {this.state.wallet &&
            <div>
                <Address wallet={this.state.wallet}/>
                <br/>
                <Balance wallet={this.state.wallet}/>
                <hr/>
                <Send wallet={this.state.wallet}/>
            </div>
            }
        </div>
    }
}

import('./pkg')
    .then(wasm => {
        ReactDOM.render(<App wasm={wasm}/>, document.getElementById('root'))
    })
    .catch(console.error)
