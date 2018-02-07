// const sql = require('sqlite');

// module.exports.execute = async (req, res) => {
//   const var1 = req.query.var1;
//   const var2 = req.query.var2;
//   const type = ['eidolon', 'kamihime', 'soul'];
//   const rarity = [
//     'ssra', 'ssr', 'sr', 'r',
//     'standard', 'elite', 'legendary'
//   ];
//   const checkType = (var1, var2) => {
//     if(type['eidolon'].includes(var1) || type['eidolon'].includes(var2))
//       return 'eidolon';
//     else if(type['kamihime'].includes(var1) || type['kamihime'].includes(var2))
//       return 'kamihime';
//     else
//       return 'soul';
//   };
//   const checkRarity = (var1, var2) => {
//     if(checkType == 'eidolon' || checkType == 'kamihime') {
//         if( checkType == 'kamihime' && (rarity['ssra'].includes(var1) || rarity['ssra'].includes(var2)) )
//           return 'ssra';
//         if( rarity['ssr'].includes(var1) || rarity['ssr'].includes(var2) )
//           return 'ssr';
//         else if( rarity['sr'].includes(var1) || rarity['sr'].includes(var2) )
//           return 'sr';
//         else if( rarity['r'],includes(var1) || rarity['r'].includes(var2) )
//           return 'r';
//     }
//     else {
//       if( rarity['legendary'].includes(var1) || rarity['legendary'].includes(var2) )
//           return 'legendary';
//         else if( rarity['elite'].includes(var1) || rarity['elite'].includes(var2) )
//           return 'elite';
//         else if( rarity['standard'],includes(var1) || rarity['standard'].includes(var2) )
//           return 'standard';
//     }
//   };
// }