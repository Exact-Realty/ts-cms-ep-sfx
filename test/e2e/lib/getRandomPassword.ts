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

import getRandomIntInRange from './getRandomIntInRange.js';

const getRandomPassword_ = () => {
	const buffer = Buffer.alloc(getRandomIntInRange(6, 12));
	crypto.getRandomValues(buffer);

	return buffer.toString('base64').replace(/={1,2}$/, '');
};

export default getRandomPassword_;
