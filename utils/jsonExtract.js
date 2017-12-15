module.exports = {
    element: value => {
            let element;
            switch(value) {
                    case 0:
                            element = "Fire";
                            break;
                    case 1:
                            element = "Water";
                            break;
                    case 2:
                            element = "Wind";
                            break;
                    case 3:
                            element = "Thunder";
                            break;
                    case 4:
                            element = "Dark";
                            break;
                    case 5:
                            element = "Light";
                            break;
            }
            return element;
    },

    character: value => {
            let type;
            switch(value) {
                    case 'special':
                            type = 'Tricky';
                            break;
                    case 'attack':
                            type = 'Offense';
                            break;
                    case 'heal':
                            type = 'Healer';
                            break;
                    default: {
                            type = value.charAt(0).toUpperCase();
                            type += value.slice(1);
                    }
            }
            return type;
    },

    ability: value => {
        let name = '';
        name += value.name;
        name += ` (${value.recast}T${value.second !== '' && value.turn
        ? `|${value.turn}T|${value.second}S`
        : value.second === ''
                ? value.turn === ''
                ? ''
                : '|' + value.turn + 'T'
                : '|' + value.second + 'S'})`;
        name = name.replace(/\+/g, '');
            return name.replace(/'/g, '\'\'');
    },

    abilityText: value => {
        let type, percentage = 10, descArr = [], description = '';
        switch(value.type) {
                case 25:
                case 33:
                case 50:
                case 15:
                case 45:
                case 53:
                        type = 'Frame A';
                        break;
                case 44:
                case 31:
                        type = 'Frame B';
                        break;
                case 45:
                case 49:
                        type = 'Frame B/C/D | **Conflict!**';
                        break;
                default: type = '';
        }
        for (let i=0; i < value.description.length; i++) {
                if(typeof descArr !== 'undefined' && descArr.indexOf('/') > -1) break;
                descArr.push(value.description[i]);
                if(value.description[i] === '+' && descArr.indexOf('/') < 0)
                        percentage += 5;
        }

        description += value.description;
        description += ` ${ (value.description.includes('ATK') || value.description.includes('DEF')) && (value.description.includes('↑') || value.description.includes('↓'))
            ? `(${percentage}%${type ? ` | ${type}` : ''})`
            : `` }`
        return description.replace(/'/g, '\'\'');
    },

    assistAbility: value => {
        let name = '';
        name += value.name;
        name += ` (${value.description})`;
        name = name.replace(/\+/g, '');
        return name.replace(/'/g, '\'\'');
    },

    eidoAttack: value => {
        let name = '';
        name += value.name;
        name += ` (${value.turn}T)`;
        name = name.replace(/\+/g, '');
        return name.replace(/'/g, '\'\'');
    },

    eidoAttackText: value => {
        let percentage = 10, descArr = [], description = '';
        for (let i=0; i < value.description.length; i++) {
                if(typeof descArr !== 'undefined' && descArr.indexOf('/') > -1) break;
                descArr.push(value.description[i]);
                if(value.description[i] === '+' && descArr.indexOf('/') < 0)
                        percentage += 5;
        }

        description += value.description;
        description += ` ${ (value.description.includes('ATK') || value.description.includes('DEF')) && (value.description.includes('↑') || value.description.includes('↓')) && percentage !== 30
            ? `(${percentage}%)`
            : `` }`
        return description.replace(/'/g, '\'\'');
    },

    eidoPassive: value => {
        return value.name.replace(/'/g, '\'\'');
    },

    eidoPassiveText: value => {
        return value.description.replace(/'/g, '\'\'');
    }
};