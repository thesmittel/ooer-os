import {crypto} from "@std/crypto"
import {encodeHex} from "@std/encoding/hex"
import * as encode from "@std/encoding"
const encoder = new TextEncoder()

export function randomId(length : number) : string {
    const rBytes = crypto.getRandomValues(new Uint8Array(length))
    return encode.encodeHex(rBytes)
    // const randomBytes : string[] = Array.from(Crypto.cryptoRandomString({length: length, type: type}));
    // return randomBytes.map((a : string) => {return  parseInt(a) % 10}).join("");
}

export function generateToken() : string {
    const token : Uint8Array = crypto.getRandomValues(new Uint8Array(128))
    return encode.encodeBase64(token)
    // return Crypto.cryptoRandomString({length: 128, type: "base64"})
}

export function generateSalt() : string {
    const salt : Uint8Array = crypto.getRandomValues(new Uint8Array(64))
    return encode.encodeBase64(salt)
    
    // return Crypto.cryptoRandomString({length: 64, type: "base64"});
}

export function hashPassword(saltedPassword : string) : string {
    // maybe will need a different hashing alg at some point 
    return encode.encodeBase64(crypto.subtle.digestSync("SHA3-512", encoder.encode(saltedPassword)))
}