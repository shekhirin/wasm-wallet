use std::str::FromStr;
use std::sync::Arc;

use async_trait::async_trait;
use bn_rs::BigNumber;
use ethers::middleware::gas_oracle::GasOracleError;
use ethers::prelude::gas_oracle::{EthGasStation, GasOracle, GasOracleMiddleware};
use ethers::prelude::*;
use ethers::signers::coins_bip39::English;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::future_to_promise;

pub mod utils;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
#[derive(Debug)]
pub enum Chain {
    // Mainnet,
    Ropsten,
    Kovan,
    Rinkeby,
    Goerli,
    Ganache,
}

impl Chain {
    fn id(&self) -> u64 {
        match self {
            // Chain::Mainnet => 1,
            Chain::Ropsten => 3,
            Chain::Kovan => 42,
            Chain::Rinkeby => 4,
            Chain::Goerli => 5,
            Chain::Ganache => 1337,
        }
    }

    fn endpoint(&self) -> String {
        match self {
            Chain::Ganache => "ws://localhost:8545".to_string(),
            chain => format!(
                "wss://{:?}.infura.io/ws/v3/b1fa39f2403447e0b0c84baf43444820",
                chain
            )
            .to_lowercase(),
        }
    }
}

type Client = Arc<
    GasOracleMiddleware<SignerMiddleware<Provider<Ws>, LocalWallet>, UltraGasOracle<EthGasStation>>,
>;

#[wasm_bindgen]
pub struct Wallet {
    client: Client,
}

#[derive(Debug)]
struct UltraGasOracle<T: GasOracle> {
    gas_oracle: T,
}

#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
impl<T: GasOracle> GasOracle for UltraGasOracle<T> {
    async fn fetch(&self) -> Result<U256, GasOracleError> {
        self.gas_oracle.fetch().await
    }

    async fn estimate_eip1559_fees(&self) -> Result<(U256, U256), GasOracleError> {
        Ok((self.fetch().await?, 0.into()))
    }
}

#[wasm_bindgen]
pub async fn connect(chain: Chain, mnemonic: String) -> Result<Wallet, JsValue> {
    utils::set_panic_hook();

    let provider = Provider::new(
        Ws::connect(chain.endpoint().as_str())
            .await
            .map_err(|err| format!("{:?}", err))?,
    );
    let wallet = MnemonicBuilder::<English>::default()
        .phrase(mnemonic.as_str())
        .build()
        .map_err(|err| format!("{:?}", err))?
        .with_chain_id(chain.id());

    let client = Arc::new(GasOracleMiddleware::new(
        SignerMiddleware::new(provider, wallet),
        UltraGasOracle {
            gas_oracle: EthGasStation::new(None),
        },
    ));

    Ok(Wallet { client })
}

#[wasm_bindgen]
impl Wallet {
    pub fn address(&self) -> js_sys::Promise {
        let client = self.client.clone();

        future_to_promise(async move {
            // let address = client
            //     .lookup_address(client.inner().address())
            //     .await
            //     .unwrap_or(format!("{:#x}", client.inner().address()));
            let address = format!("{:#x}", client.inner().address());

            Ok(address.into())
        })
    }

    pub fn balance(&self) -> js_sys::Promise {
        let client = self.client.clone();

        future_to_promise(async move {
            client
                .get_balance(client.inner().address(), None)
                .await
                .map(|balance| BigNumber::from(balance).into())
                .map_err(|e| e.to_string().into())
        })
    }

    pub fn send(&self, address: Option<String>, amount: BigNumber) -> js_sys::Promise {
        let client = self.client.clone();

        future_to_promise(async move {
            let amount = U256::try_from(amount)?;

            let address = if let Some(address) = address {
                Address::from_str(address.as_str()).map_err(|err| err.to_string())?
            } else {
                Address::zero()
            };

            let tx = TransactionRequest::new()
                .to(address)
                .value(amount)
                .gas(21000);

            client
                .send_transaction(tx, None)
                .await
                .map(|tx| format!("{:#x}", H256(tx.0)).into())
                .map_err(|e| e.to_string().into())
        })
    }
}
