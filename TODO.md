- Мастер добавления атак для каждого участника
- CHECK: Справка по приложению, таб или большой всплывающий фрагмент
- Модальное окно с деталями ошибок конфига/синтаксиса, найденных перед симуляцией (сейчас они пишутся в лог).
- Иммунитеты (нежить к яду и т.п.)
- Все монстры из 0e
- use Dice lib (ttrpg-lib-dice) where possible
- message storage, to keep all the message templates in one place
- validateCharacters: min/max limits
- rework
```ts
const sim = new BattleSimulator(
      players,
      monsters,
      settings.strategy,
      settings.rounding,
      settings.biasPlayers,
      settings.biasMonsters,
      settings.maxAttacksPerTarget,
      battleLogger,
    )

// to

const sim = new BattleSimulator(
  players,
  monsters,
  battleLogger,
  settings
)
```
