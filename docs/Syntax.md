# Transforms

## Highlights

`::I am a highlight!::` turns into `==I am a highlight!==`

## Nested tags

I'm only going to support `#tags/like/this`.
Which turns into `#tags_like_this`.

`_` replaces `/`, which means I cannot use `_` in tag names in my notes.

I'm not supportings special characters (though Bear.app does),
so `#tags*with/$characters`, I won't look for.

Also, trailing slash `#foo/` is not supported in my world either. In Bear, the trailing slash would be ignored, but in Obsidian it won't. So don't use 'em.

I do support `#tags with spaces/that are nested#`. That will become `#tags with spaces_that are nested#`.

## Check-lists

```
- Things
- To do
+ And done
```

turns into

```
- [ ] Things
- [ ] To do
- [x] And done
```

## Lists

```
* Unordered
* Lists
```

turns into

```
- Unordered
- Lists
```
