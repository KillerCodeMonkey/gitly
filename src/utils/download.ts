import GitlyOptions from '../interfaces/options'

import fetch from './fetch'
import execute from './execute'
import exists from './exists'
import { isOffline } from './offline'
import parse from './parse'
import { getFile, getUrl } from './tar'

/**
 * Download the tar file from the repository
 * and store it in a temporary directory
 * @param repository The repository to download
 * @param options
 *
 * @example
 * ```js
 * // ..
 * const path = await download('iwatakeshi/git-copy')
 * // ...
 * ```
 */
export default async function download(
  repository: string,
  options: GitlyOptions = {}
) {
  const info = parse(repository, options)
  const file = getFile(info, options)
  const url = getUrl(info, options)
  const local = async () => exists(file)
  const remote = async () => fetch(url, file)
  let order = [local, remote]
  if ((await isOffline()) || options.cache) {
    order = [local]
  } else if (options.force || info.type === 'master') {
    order = [remote, local]
  }

  try {
    const result = await execute(order)
    if (typeof result === 'boolean') {
      return file
    }
    return result
  } catch (error) {
    if (options.throw) {
      throw error
    }
  }
  return ''
}
