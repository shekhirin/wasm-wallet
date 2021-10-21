use primitive_types::U256;
use std::convert::TryInto;
use std::str::FromStr;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(module = "bn.js")]
extern "C" {
    pub type BN;

    #[wasm_bindgen(constructor)]
    pub fn new(number: String, base: u32) -> BN;

    #[wasm_bindgen(method)]
    fn toString(this: &BN, base: u32) -> String;
}

impl From<U256> for BN {
    // TODO: lol optimize
    fn from(u256: U256) -> Self {
        BN::new(format!("{}", u256), 10)
    }
}

impl TryInto<U256> for BN {
    type Error = String;

    // TODO: lol optimize
    fn try_into(self) -> Result<U256, Self::Error> {
        U256::from_dec_str(&self.toString(10)).map_err(|err| err.to_string())
    }
}
