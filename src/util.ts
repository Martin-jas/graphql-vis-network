export const intensityColor = (from:string, to: string, lvl:number) => {
  const fromColor = parseInt(from, 16)
  const toColor = parseInt(to, 16)
  
  return Math.round(fromColor + (toColor-fromColor)*lvl).toString(16)
}


export async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }