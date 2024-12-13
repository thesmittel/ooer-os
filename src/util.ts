import {crypto} from "@std/crypto"


import * as Crypto from "https://deno.land/x/crypto_random_string@1.1.0/mod.ts";

import {encodeHex} from "@std/encoding/hex"
import * as encode from "@std/encoding"
import * as Types  from "./types.ts";

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

export function grabUserData(id : string) : (Types.User | undefined) {
    const user : Types.User[] = JSON.parse(Deno.readTextFileSync("../../server/users/userdata.json")).users.filter((a : Types.User) => a.id == id)
    if (user.length != 1) return undefined;
    return user[0]
}

export function tokenGen() : string {
    const token : Uint8Array = crypto.getRandomValues(new Uint8Array(64))
    return encode.encodeBase64(token)
}