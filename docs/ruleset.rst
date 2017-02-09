=================
Ruleset Reference
=================

These are the control structures which govern the flow of scores, types, and notes through a ruleset.

Left-hand Sides
===============

Left-hand sides are currently a few special forms which select nodes to be fed to right-hand sides.

.. autofunction:: and(typeCall[, typeCall, ...])
.. autofunction:: dom

.. function:: type(theType)

   Take nodes that have the given type. Example: ``type('titley')``

   .. autofunction:: TypeLhs#max

Right-hand Sides
================

A right-hand side is a strung-together series of calls like this::

    type('smoo').func(blah).type('whee').score(2)

Calls layer together like sheets of transparent acetate: if there are repeats, as with ``type`` in the previous example, the rightmost takes precedence and the left becomes useless. Similarly, if ``props``, which can return multiple properties of a fact (element, note, score, and type), is missing any of these properties, we continue searching to the left for anything that provides them (excepting other ``props`` calls—if you want that, write a combinator, and use it to combine the 2 functions you want)). To prevent this, return all properties explicitly from your props callback, even if they are no-ops (like ``{score: 1, note: undefined, type: undefined}``). Aside from this layering precedence, the order of calls does not matter.

A good practice is to use more declarative calls—``score``, ``note``, and ``type``—as much as possible and save ``props`` for when you need it. The query planner can get more out of the more specialized calls without you having to tack on verbose hints like :func:`~InwardRhs.atMost` or ``typeIn``.

.. autofunction:: InwardRhs#atMost
.. autofunction:: InwardRhs#conserveScore

.. autofunction:: InwardRhs#props

   For example...

   .. code-block:: js

      function callback(fnode) {
          return [{score: 3,
                   element: fnode.element,  // unnecessary, since this is the default
                   type: 'texty',
                   note: {suspicious: true}}];
      }

   If you use ``props``, Fathom cannot look inside your callback to see what type you are emitting, so you must declare your output types with ``typeIn`` or set a single static type with ``type``. Fathom will complain if you don't. (You can still opt not to return any type if the node turns out not to be a good match, even if you declare a ``typeIn``.

.. autofunction:: InwardRhs#note

   Since every node can have multiple, independent notes (one for each type), this applies to the type explicitly set by the RHS or, if none, to the type named by the `type` call on the LHS. If the LHS has none because it's a `dom(...)` LHS, an error is raised.

   When you query for fnodes of a certain type, you can expect to find notes of any form you specified on any RHS with that type. If no note is specified, it will be undefined. However, if two RHSs emits a given type, one adding a note and the other not adding one (or adding an undefined one), the meaningful note overrides the undefined one. This allows elaboration on a RHS's score (for example) without needing to repeat note logic.

   Indeed, ``undefined`` is not considered a note. So, though notes cannot in general be overwritten, a note that is ``undefined`` can. Symmetrically, an ``undefined`` returned from a ``note`` or ``props`` or the like will quietly decline to overwrite an existing defined note, where any other value would cause an error. Rationale: letting ``undefined`` be a valid note value would mean you couldn't shadow a leftward note in a RHS without introducing a new singleton value to serve as a "no value" flag. It's not worth the complexity and the potential differences between the (internal) fact and fnode note value semantics.

   Best practice: any rule adding a type should apply the same note. If only one rule of several type-foo-emitting ones did, it should be made to emit a different type instead so downstream rules can explicitly state that they require the note to be there. Otherwise, there is nothing to guarantee the note-adding rule will run before the note-needing one.

.. autofunction:: out
.. autofunction:: OutwardRhs#through
.. autofunction:: InwardRhs#score
.. autofunction:: InwardRhs#type
.. autofunction:: InwardRhs#typeIn(type[, type, ...])