# Augmented Hosts File Format

A hosts file (like `/etc/hosts` in Linux, `C:\Windows\System32\drivers\etc\hosts` for Windows, etc) has a simple, 
standardized format across operating system. Each line is either an address assignment, a comment, or blank. Comments 
are also supported at the end of an assignment line. All comments are simply indicated with a `#`, and the rest is
ignored.

```
# This is a line comment

127.0.0.1 example.com     # Another comment
```

This format has served everyone well when it comes to DNS implementations; it's very straightforward and easy to read.
And for the use case of setting permanent static DNS overrides, there's not much left to want in a file format.
However, where I work, and maybe where you do as well, your host file might look quite a bit more complicated:

```
# Foo application

#127.0.0.1          foo.example.com   # Local debugging

# Amsterdam
#28.10.14.34        foo.example.com   # VIP
#61.63.7.3          foo.example.com   # AMWEBLN001
#61.63.7.4          foo.example.com   # AMWEBLN002
61.63.7.5          foo.example.com   # AMWEBLN003
#61.63.7.6          foo.example.com   # AMWEBLN004
#61.63.7.7          foo.example.com   # AMWEBLN005
#61.63.7.8          foo.example.com   # AMWEBLN006
#61.63.12.1         foo.example.com   # AMWEBLN007
#61.63.12.2         foo.example.com   # AMWEBLN008
#61.63.12.3         foo.example.com   # AMWEBLN009
#61.63.12.4         foo.example.com   # AMWEBLN010

# Jakarta
# 57.39.58.1        foo.example.com   # VIP
# 65.32.94.100      foo.example.com   # JKWEBLN001
# 65.32.94.101      foo.example.com   # JKWEBLN002
# 65.32.94.102      foo.example.com   # JKWEBLN003
# 65.32.94.103      foo.example.com   # JKWEBLN004

##################################################
# Foo API
##################################################

#
# Reminder! HTTPS is provided by proxy. Use HTTP
# only when pointing directly to a server.
# 

#28.10.14.35        api.example.com   # VIP
#61.63.7.9          api.example.com   # AMAPILN001
#61.63.7.10         api.example.com   # AMAPILN002
```

What a versatile thing a comment is! In this example, it is used as:

1. A section heading
2. A toggling mechanism for related entries
3. Labeling to describe an address
4. Line art
5. Notes

This is because for many of us, a host file is more than config file; it's a document for listing servers & routers
and a utility to switch a domain name among those.

In order to support the goals of this utility to manage these monsters, we need to define additional semantics for the
humble comment so the host file can be understood as more than just address assignments.

## Informal extended grammar for the hostfile

A host file is made up of a list of host specs.

```
hostfile :: hostSpec*
```

A host spec is made up of an optional preamble and one or more address blocks.

```
hostSpec :: preamble? addressBlock+
```

The preamble for a host spec is used to label and provide commentary about a host. It is acknowledged that comments
may be mis-associated with a given host due to this grammer, and they may actually be referring to a larger collection.
Due to lack of structure and ambiguity within the file, this cannot be remedied at this time.

```
preamble      :: blockComments
blockComments :: (blankLine|tagsLine|commentLine)*
blankLine     :: WS* EOL
```

Host tag comments, note comments, and disabled address assignments are all full-line comments. What differentiates them
is in the content that comes after the hash. A disabled address assignment is the most specific of the three, and must
contain only an IP address (v4 or v6), followed by a hostname, followed by an optional end-of-line comment.

```
assignment         :: WS* IP WS+ HOST WS* addressComment?
disabledAssignment :: WS* "#" assignment
```

A host tags comment is the next most specific, and must be composed of one or more words, separated by a comma-separated
list of tags:

```
tagsLine :: WS* "#" tags
tags     :: WS* WORD WS* (COMMA WS* WORD WS*)*
```

Any other full-line comment is considered notes with no semantic meaning.

The first commented-out or uncommented address assignment signals the beginning of an address block. An address block
continues until either a comment line or an address assignment (commented or uncommented) for a different hostname is
encountered.

The last tag line encountered in the host block doubles as tags associated with the first address block. For
host blocks that only have one block of addresses, this has no impact, but for multiple address block scenarios, there 
is ambiguity on whether the tags refer to the host or to a block of addresses.

```
addressBlock :: (blockComments (assignment|disabledAssignment))+
```

