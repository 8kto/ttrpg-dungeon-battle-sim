- Мастер добавления атак для каждого участника
- Справка по приложению, таб или большой всплывающий фрагмент
- Строка со спасами может быть скрыта, кнопка Раскрыть/Скрыть всё
- Чекбоксы рядом с Добавить монстра: Ядовитый, Паралич, Огненный
- Настройка Targeting («sticky target»): Random — каждая атака выбирает случайную цель; Focus — атакующий
  бьёт одну цель, пока кто-то из них не умрёт.
- Модальное окно с деталями ошибок конфига/синтаксиса, найденных перед симуляцией (сейчас они пишутся в лог).
- Иммунитеты (нежить к яду и т.п.)
- Все монстры из 0e
- Bias max 99?
- use Dice lib (ttrpg-lib-dice) where possible
- enum for Modifiers
- convert utils set into a service, damage parser
- message storage, to keep all the message templates in one place
- avoid patterns like

```ts
  modifier.kind === 'paralyze'
    ? `🧊 ${target.char.name} paralyzed ${duration}`
    : `🔥 ${target.char.name} affected by ${effect.label} damage_each_round ${duration}`,
```

instead:

```ts
switch (modifier.kind) {
  case:

  default:
    throw new Error()
}
```
