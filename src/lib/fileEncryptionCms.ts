/* Copyright © 2024 Exact Realty Limited. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License") with LLVM
 * exceptions; you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 *
 * http://llvm.org/foundation/relicensing/LICENSE.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fileEncryptionCms_ = async (
	deriveKEK: {
		(): Promise<[KEK: CryptoKey, salt: Uint8Array, iterationCount: number]>;
	},
	data: AllowSharedBufferSource,
): Promise<
	[
		salt: AllowSharedBufferSource,
		iterationCount: number,
		noncePWRI: AllowSharedBufferSource,
		encryptedKey: AllowSharedBufferSource,
		nonceECI: AllowSharedBufferSource,
		encryptedContent: AllowSharedBufferSource,
	]
> => {
	let iterationCount: number = NaN;
	let salt: Uint8Array = new Uint8Array(0);

	const noncePWRI = new Uint8Array(12);
	const nonceECI = new Uint8Array(12);

	globalThis.crypto.getRandomValues(noncePWRI);
	globalThis.crypto.getRandomValues(nonceECI);

	const [encryptedKey, encryptedContent] = await globalThis.crypto.subtle
		.generateKey({ ['name']: 'AES-GCM', ['length']: 256 }, true, [
			'encrypt',
		])
		.then((CEK) => {
			const KEKp = deriveKEK().then(([lKEK, lSalt, lIterationCount]) => {
				iterationCount = lIterationCount;
				salt = lSalt;
				return lKEK;
			});

			return Promise.all([
				Promise.all([
					KEKp,
					globalThis.crypto.subtle.exportKey('raw', CEK),
				]).then(([KEK, rawCEK]) => {
					return globalThis.crypto.subtle.encrypt(
						{
							['name']: 'AES-GCM',
							['iv']: noncePWRI,
							['tagLength']: 128,
						},
						KEK,
						rawCEK,
					);
				}),
				globalThis.crypto.subtle.encrypt(
					{
						['name']: 'AES-GCM',
						['iv']: nonceECI,
						['tagLength']: 128,
					},
					CEK,
					data,
				),
			]);
		});

	return [
		salt,
		iterationCount,
		noncePWRI,
		encryptedKey,
		nonceECI,
		encryptedContent,
	];
};

export default fileEncryptionCms_;
