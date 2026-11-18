- Иммунитеты (нежить к яду и т.п.)
- Все монстры из 0e
- use Dice lib (ttrpg-lib-dice) where possible
- introduce name for a damage, e.g. `d6<Sword>[damage_each_round(d4,3)] | d4<Fire Breath>[breath,save_for_half(d6)], d4<dagger>`

```
## new syntax
d4[breath, save_for_half(d6)] ==> d4[<Fire Breath>, Save vs Breath for half (d6)]
d6[poison, save_or_die] ==> d6[Save vs Poison or die]
d6[poison, save_or_die(+2)] ==> d6[Save vs Poison(+2) or die]
d6[paralyze(+2), paralyze(d4)] ==> d6[Save vs Paralyze(+2) or paralyzed for (d4) rounds]
d6[paralyze(-2), paralyze] ==> d6[Save vs Paralyze(-2) or paralyzed]
d6[breath, save_for_half(2d6)] ==> d6[Save vs Breath for half (2d6)]
d6[Sword, damage_each_round(d4,3)] ==> d6[<Sword>, d4/round for 3 rounds]
d6[Sword, damage_each_round(d4)]  ==> d6[<Sword>, d4/round]
d4, d4 | d10[fire, damage_each_round(d4, 3)] ==> d4, d4 | d10[<Fire>, d4/round for 3 rounds]
d10[device, damage_each_round(d4, 3)] ==> d10[Save vs Device or d4/round for 3 rounds]
d6[shock, d4] ==> d6[<shock>, d4]

## new effect
d6[magic, petrification] ==> d6[<Medusa sight>, Save vs Magic or Petrification]
```
